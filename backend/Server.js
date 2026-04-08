require("dotenv").config();

const express = require("express");
const app = express();
console.log("API KEY:", process.env.OPENROUTER_API_KEY);


const cors = require("cors");

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());



const axios = require("axios");
const OpenAI = require("openai");

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

app.post("/ask-ai", async (req, res) => {
  try {
    const { question } = req.body;

    const response = await openai.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct",
      messages: [{ role: "user", content: question }],
      stream: true,
    });

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of response) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        res.write(content);
      }
    }
    messages: [
  {
    role: "system",
    content: "You are a helpful teacher. Explain answers step by step in simple language."
  },
  { role: "user", content: question }
]

    res.end();

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "AI Error ❌" });
  }
});
// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "test@gmail.com" && password === "1234") {
    res.json({ success: true, message: "Login successful" });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});


// SIGNUP
app.post("/signup", (req, res) => {
  const { name, email, password, exam, className, city } = req.body;

  console.log("Signup:", req.body);

  res.json({
    success: true,
    message: "User registered successfully"
  });
});


// DASHBOARD
app.get("/dashboard", (req, res) => {
  res.json({
    user: "Rishabh",
    doubts: 5
  });
});


// DOUBT
app.post("/doubt", (req, res) => {
  const { question } = req.body;

  res.json({
  reply: response.choices[0].message.content,
});
});


// SERVER START
app.listen(5001, () => {
  console.log("Server running on port 5001");
});