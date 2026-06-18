require("dotenv").config();

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cors = require("cors");
const OpenAI = require("openai");
const { Server } = require("socket.io");

const User = require("./models/user");
const Chat = require("./models/Chat");
const Note = require("./models/Notes");
const Discussion = require("./models/Discussion");

const app = express();

console.log(
  "OPENROUTER_API_KEY:",
  process.env.OPENROUTER_API_KEY ? "(set)" : "(missing)",
);

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

/* =========================
   DB CONNECTION
========================= */
if (process.env.MONGO_URL) {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB connection error:", err));
}

/* =========================
   MIDDLEWARE
========================= */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://doubtify-git-main-rishabh-team.vercel.app",
      "https://doubtify-five.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json());

/* =========================
   OPENAI / OPENROUTER CLIENT
========================= */
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

/* =========================
   FILE UPLOAD (MULTER)
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

app.use("/uploads", express.static("uploads"));


/* =========================
   HTTP + SOCKET.IO SERVER
========================= */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://doubtify-git-main-rishabh-team.vercel.app",
      "https://doubtify-five.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  console.log("User connected:", socket.id);

  /* LOAD OLD MESSAGES */
  try {
    const messages = await Discussion.find().sort({ createdAt: 1 });
    socket.emit("load_messages", messages);
  } catch (err) {
    console.log(err);
  }

  /* SEND MESSAGE */
  socket.on("send_message", async (data) => {
    try {
      const saved = await Discussion.create({
        text: data.text,
        user: data.user,
        avatar: data.avatar,
        reactions: data.reactions || [],
        seenBy: data.seenBy || [],
        time: data.time,
      });

      io.emit("receive_message", saved);
    } catch (err) {
      console.log(err);
    }
  });

  /* TYPING */
  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  /* SEEN STATUS */
  socket.on("message_seen", async ({ messageId, user }) => {
    try {
      const updated = await Discussion.findByIdAndUpdate(
        messageId,
        { $addToSet: { seenBy: user } },
        { new: true },
      );

      if (!updated) return;
      io.emit("seen_updated", updated);
    } catch (err) {
      console.log(err);
    }
  });

  /* REACTION */
  socket.on("add_reaction", async ({ messageId, emoji, user }) => {
    try {
      const message = await Discussion.findById(messageId);
      if (!message) return;

      const existingReaction = message.reactions.find((r) => r.user === user);
      if (existingReaction) {
        existingReaction.emoji = emoji;
      } else {
        message.reactions.push({ emoji, user });
      }

      await message.save();
      io.emit("reaction_updated", message);
    } catch (err) {
      console.log(err);
    }
  });

  /* DELETE MESSAGE */
  socket.on("delete_message", async (id) => {
    try {
      const deleted = await Discussion.findByIdAndDelete(id);
      if (!deleted) return;
      io.emit("message_deleted", id);
    } catch (err) {
      console.log(err);
    }
  });

  /* DISCONNECT */
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

/* =========================
   SIGNUP / LOGIN
========================= */
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: "Account created successfully",
      token,
      user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Signup failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

/* =========================
   DASHBOARD
========================= */
app.get("/dashboard", async (req, res) => {
  try {
    const userId = JSON.parse(localStorage.getItem("user") || "{}")?._id;
    const user = await User.findOne();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================
   DOUBT (placeholder)
========================= */
app.post("/doubt", (req, res) => {
  const { question } = req.body;
  res.json({ success: true, question });
});

/* =========================
   PROFILE ROUTES
========================= */
app.get("/api/user/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/user/profile", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
    }).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post(
  "/api/user/upload-profile",
  upload.single("profilePic"),
  async (req, res) => {
    try {
      const imageUrl = `/uploads/${req.file.filename}`;

      await User.findByIdAndUpdate(
        req.user.id,
        { profilePic: imageUrl },
        { new: true },
      );

      res.json({ success: true, profilePic: imageUrl });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

/* =========================
   FILE UPLOAD -> NOTES
========================= */
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const note = await Note.create({
      title: req.file.originalname,
      file: `/uploads/${req.file.filename}`,
      size: (req.file.size / 1024 / 1024).toFixed(2),
    });

    res.json(note);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.get("/notes", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

app.delete("/delete-note/:id", async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    res.json({ success: true, note });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

/* =========================
   AI CHAT (ASK-AI)
========================= */
app.post("/ask-ai",upload.single("image"), async (req, res) => {
  try {
    const { question, history, chatId, temporary, userId } = req.body;

    let imageUrl = null;

    if (req.file) {

      imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    }

    console.log("IMAGE URL =", imageUrl);
    const userMsg = {
      sender: "user",
      text: question,
    };
    

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o",
      messages: [
  {
    role: "system",
    content: `
You are a helpful AI tutor and friendly teacher.

Rules:
- Use markdown formatting
- For inline maths use: $...$
- For equations use: $$...$$
- Explain step by step
- Use headings and bullet points,
- Use examples and analogies
- For code, use triple backticks with language specified
`
  },

  ...(history || []).map((msg) => ({
    role: msg.sender === "user" ? "user" : "assistant",
    content: msg.text,
  })),
  {
    role: "user",
    content: [
      {
        type: "text",
        text: question || "Solve this question",
      },
      {
        type: "image_url",
        image_url: {
          url: imageUrl,
        },
      },
    ],
  },
],
    });

    const aiMsg = {
      sender: "ai",
      text: response.choices[0].message.content,
    };

    let chat = null;

    if (!temporary) {
      if (chatId) {
        chat = await Chat.findByIdAndUpdate(
          chatId,
          {
            $push: {
              messages: {
                $each: [userMsg, aiMsg],
              },
            },
          },
          { new: true }
        );
      } else {
        chat = await Chat.create({
          userId,
          title: question.substring(0, 30),
          messages: [userMsg, aiMsg],
        });
      }
    }

    res.json({
      reply: aiMsg.text,
      chatId: chat?._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

/* =========================
   CHAT ROUTES
========================= */
app.post("/new-chat", async (req, res) => {
  try {
    const { userId } = req.body;

    const chat = await Chat.create({
      userId,
      title: "New Chat",
      messages: [],
    });

    res.json(chat);
  } catch (err) {
    res.status(500).json({
      error: "Failed to create chat",
    });
  }
});

app.get("/chat-by-id/:id", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        error: "Chat not found",
      });
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({
      error: "Chat not found",
    });
  }
});

app.get("/all-chats/:userId", async (req, res) => {
  try {
    const chats = await Chat.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch chats",
    });
  }
});

app.get("/chat", async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId });
    res.json(chat || { messages: [] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

app.delete("/delete-chat/:id", async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      error: "Delete failed",
    });
  }
});


/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
