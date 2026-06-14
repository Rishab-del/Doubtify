require("dotenv").config();

const express = require("express");
const app = express();
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

const server = http.createServer(app);

console.log(
  "OPENROUTER_API_KEY:",
  process.env.OPENROUTER_API_KEY ? "(set)" : "(missing)",
);

if (process.env.MONGO_URL) {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB connection error:", err));
}

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({
      success: false,
      message: "Access denied",
    });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

/* =========================
   AI ASK
========================= */
app.post("/ask-ai", async (req, res) => {
  try {
    const { question, history, userId, chatId, temporary } = req.body;

    const userMsg = {
      sender: "user",
      text: question,
    };

    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
You are a helpful AI tutor.

Rules:
- Use markdown formatting
- For inline maths use: $...$
- For equations use: $$...$$
- Explain step by step
- Use headings and bullet points
          `,
        },
        ...(history || []).map((msg) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text,
        })),
        {
          role: "user",
          content: question,
        },
      ],
      stream: false,
      temperature: 0.5,
      max_tokens: 500,
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
          {
            returnDocument: "after",
          },
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
      chatId: chat?._id || null,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Failed to ask AI",
    });
  }
});

/* =========================
   AUTH: SIGNUP / LOGIN
========================= */
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" },
    );

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
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" },
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

/* =========================
   DASHBOARD
========================= */
app.get("/dashboard", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* =========================
   SIMPLE DASHBOARD / DOUBT
========================= */
app.post("/doubt", (req, res) => {
  const { question } = req.body;
  res.json({ success: true, question });
});

/* =========================
   FILE UPLOAD
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

/* =========================
   PROFILE ROUTES
========================= */
app.post(
  "/api/user/upload-profile",
  auth,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      const imageUrl = `/uploads/${req.file.filename}`;

      await User.findByIdAndUpdate(
        req.user.id,
        { profilePic: imageUrl },
        { returnDocument: "after" },
      );

      res.json({
        success: true,
        profilePic: imageUrl,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

app.get("/api/user/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/user/profile", auth, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {
      returnDocument: "after",
    }).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    console.log(err);
    res.status(500).json({ error: "Failed to create chat" });
  }
});

app.get("/chat-by-id/:id", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    res.json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Chat not found" });
  }
});

app.get("/all-chats/:userId", async (req, res) => {
  try {
    const chats = await Chat.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 });

    res.json(chats);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

app.delete("/delete-chat/:id", async (req, res) => {
  try {
    const deletedChat = await Chat.findByIdAndDelete(req.params.id);
    console.log("Deleted:", deletedChat);
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

app.get("/chat/:userId", async (req, res) => {
  const chat = await Chat.findOne({
    userId: req.params.userId,
  });

  res.json(chat || { messages: [] });
});

/* =========================
   NOTES ROUTES
========================= */
app.get("/notes", async (req, res) => {
  try {
    const notes = await Note.find().sort({
      createdAt: -1,
    });

    res.json(notes);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

app.delete("/delete-note/:id", async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      note,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

/* =========================
   SOCKET.IO CHAT EVENTS
========================= */
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  console.log("User connected:", socket.id);

  try {
    const messages = await Discussion.find().sort({
      createdAt: 1,
    });

    socket.emit("load_messages", messages);
  } catch (err) {
    console.log(err);
  }

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

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  socket.on("message_seen", async ({ messageId, user }) => {
    try {
      const updated = await Discussion.findByIdAndUpdate(
        messageId,
        {
          $addToSet: {
            seenBy: user,
          },
        },
        {
          new: true,
        },
      );

      if (!updated) return;

      io.emit("seen_updated", updated);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("add_reaction", async ({ messageId, emoji, user }) => {
    try {
      const message = await Discussion.findById(messageId);

      if (!message) return;

      const existingReaction = message.reactions.find((r) => r.user === user);

      if (existingReaction) {
        existingReaction.emoji = emoji;
      } else {
        message.reactions.push({
          emoji,
          user,
        });
      }

      await message.save();

      io.emit("reaction_updated", message);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("delete_message", async (id) => {
    try {
      const deleted = await Discussion.findByIdAndDelete(id);

      if (!deleted) return;

      io.emit("message_deleted", id);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
