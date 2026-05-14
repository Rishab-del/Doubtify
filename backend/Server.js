require("dotenv").config();

const express = require("express");
const app = express();

console.log(
  "API KEY:",
  process.env.OPENROUTER_API_KEY
);

const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URL)
  .then(() =>
    console.log("MongoDB Connected")
  )
  .catch((err) => console.log(err));

const cors = require("cors");

const Chat = require("./models/Chat");

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

const OpenAI = require("openai");

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

/* =========================
   NEW CHAT
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

    res.status(500).json({
      error: "Failed to create chat",
    });
  }
});

/* =========================
   GET CHAT BY ID
========================= */

app.get("/chat-by-id/:id", async (req, res) => {

  try {

    const chat = await Chat.findById(
      req.params.id
    );

    res.json(chat);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "Chat not found",
    });
  }
});

/* =========================
   ALL CHATS
========================= */

app.get("/all-chats/:userId", async (req, res) => {

  try {

    const chats = await Chat.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 });

    res.json(chats);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "Failed to fetch chats",
    });
  }
});

/* =========================
   ASK AI
========================= */

app.post("/ask-ai", async (req, res) => {

  try {

    const {
      question,
      history,
      userId,
      chatId,
      temporary,
    } = req.body;

    /* USER MESSAGE */
    const userMsg = {
      sender: "user",
      text: question,
    };

    /* AI RESPONSE */
    const response =
      await openai.chat.completions.create({
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
            role:
              msg.sender === "user"
                ? "user"
                : "assistant",

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

    /* AI MESSAGE */
    const aiMsg = {
      sender: "ai",

      text:
        response.choices[0].message.content,
    };

/* SAVE TO DB */
let chat = null;

/* SAVE ONLY IF NOT TEMPORARY */

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
      }
    );

  } else {

    chat = await Chat.create({

      userId,

      title: question.substring(0, 30),

      messages: [userMsg, aiMsg],
    });
  }
}
/* RESPONSE */

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

app.delete(
  "/delete-chat/:id",

  async (req, res) => {

    try {

      const deletedChat =
        await Chat.findByIdAndDelete(
          req.params.id
        );

      console.log(
        "Deleted:",
        deletedChat
      );

      res.json({
        success: true,
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        error: "Delete failed",
      });
    }
  }
);

/* =========================
   GET LAST CHAT
========================= */

app.get("/chat/:userId", async (req, res) => {

  const chat = await Chat.findOne({
    userId: req.params.userId,
  });

  res.json(chat || { messages: [] });
});

/* =========================
   LOGIN
========================= */

app.post("/login", (req, res) => {

  const { email, password } = req.body;

  if (
    email === "test@gmail.com" &&
    password === "1234"
  ) {

    res.json({
      success: true,
      message: "Login successful",
    });

  } else {

    res.json({
      success: false,
      message: "Invalid credentials",
    });
  }
});

/* =========================
   SIGNUP
========================= */

app.post("/signup", (req, res) => {

  console.log("Signup:", req.body);

  res.json({
    success: true,
    message:
      "User registered successfully",
  });
});

/* =========================
   DASHBOARD
========================= */

app.get("/dashboard", (req, res) => {

  res.json({
    user: "Rishabh",
    doubts: 5,
  });
});

/* =========================
   FILE UPLOAD
========================= */

const multer = require("multer");

const storage = multer.diskStorage({

  destination: "uploads/",

  filename: (req, file, cb) => {

    cb(
      null,
      Date.now() +
        "-" +
        file.originalname
    );
  },
});

const upload = multer({ storage });

app.post(
  "/upload",
  upload.single("file"),

  (req, res) => {

    res.json({
      file: `/uploads/${req.file.filename}`,

      title: req.file.originalname,
    });
  }
);

/* =========================
   SERVER START
========================= */

app.listen(5001, () => {

  console.log(
    "Server running on port 5001"
  );
});