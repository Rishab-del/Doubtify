require("dotenv").config();

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const cors = require("cors");
const OpenAI = require("openai");
const { Server } = require("socket.io");

const User = require("./models/user");
const Chat = require("./models/Chat");
const Note = require("./models/Notes");
const Discussion = require("./models/Discussion");
const Event = require("./models/Events");
const Doubt = require("./models/Doubt");
const Razorpay = require("razorpay");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const app = express();
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Doubtify backend is running",
    otpRoutesAvailable: true,
  });
});

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
  .connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 15000,
  })
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.name);
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
  });
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
   EMAIL OTP CONFIGURATION
========================= */
/* =========================
   EMAIL OTP CONFIGURATION
========================= */

const otpStore = new Map();

const OTP_SECRET = process.env.OTP_SECRET;

// Email transporter
const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Generate a 6-digit OTP
function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

// Hash OTP before storing it
function hashOtp(otp, destination, purpose) {
  if (!OTP_SECRET) {
    throw new Error("OTP_SECRET is missing in environment variables.");
  }

  return crypto
    .createHmac("sha256", OTP_SECRET)
    .update(`${destination}:${purpose}:${otp}`)
    .digest("hex");
}

/* =========================
   SEND EMAIL OTP
========================= */

app.post("/otp/send", async (req, res) => {
  console.log("OTP SEND ROUTE HIT:", req.body);

  try {
    const { type, destination, purpose } = req.body;

    // 1. Check environment configuration
    if (
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_APP_PASSWORD ||
      !OTP_SECRET
    ) {
      console.error("OTP configuration is incomplete.");

      return res.status(500).json({
        success: false,
        message: "Email OTP service is not configured.",
      });
    }

    // 2. Allow email OTP for signup only
    if (type !== "email" || purpose !== "signup") {
      return res.status(400).json({
        success: false,
        message: "Email signup OTP is currently supported.",
      });
    }

    // 3. Normalize email
    const email = String(destination || "")
      .trim()
      .toLowerCase();

    // 4. Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // 5. Check if email is already registered
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered. Please log in.",
      });
    }

    // 6. Check resend cooldown
    const key = `signup:email:${email}`;
    const previous = otpStore.get(key);
    const now = Date.now();

    if (previous && now - previous.sentAt < 60_000) {
      const remainingSeconds = Math.ceil(
        (60_000 - (now - previous.sentAt)) / 1000
      );

      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingSeconds} seconds before requesting another OTP.`,
      });
    }

    // 7. Generate OTP
    const otp = generateOtp();

    // 8. Save OTP hash temporarily
    otpStore.set(key, {
      hash: hashOtp(otp, email, "signup"),
      expiresAt: now + 5 * 60 * 1000,
      sentAt: now,
      attempts: 0,
      verified: false,
    });

    // 9. Send email
    try {
      const result = await emailTransporter.sendMail({
        from: {
          name: "Doubtify",
          address: process.env.EMAIL_USER,
        },
        to: email,
        subject: "Your Doubtify Email Verification Code",
        text: [
          `Hello,`,
          ``,
          `Your Doubtify email verification OTP is: ${otp}`,
          ``,
          `This OTP expires in 5 minutes.`,
          `Do not share this code with anyone.`,
          ``,
          `If you did not request this code, please ignore this email.`,
          ``,
          `Team Doubtify`,
        ].join("\n"),
      });

      console.log("OTP email accepted by mail server:", {
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected,
      });
    } catch (mailError) {
      // Remove OTP if email delivery fails
      otpStore.delete(key);

      console.error("Email OTP delivery failed:", {
        message: mailError.message,
        code: mailError.code,
        response: mailError.response,
      });

      return res.status(502).json({
        success: false,
        message: "Unable to send OTP email. Please try again later.",
      });
    }

    // 10. Send success response
    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please check your inbox and spam folder.",
    });

  } catch (err) {
    console.error("OTP send error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Unable to send OTP.",
    });
  }
});
/* =========================
   VERIFY EMAIL OTP
========================= */
/* =========================
   VERIFY EMAIL OTP
========================= */

app.post("/otp/verify", async (req, res) => {
  console.log("OTP VERIFY ROUTE HIT:", req.body);
  try {
    const { type, destination, otp, purpose } = req.body;

    // 1. Check OTP configuration
    if (!process.env.OTP_SECRET) {
      console.error("OTP_SECRET is missing.");

      return res.status(500).json({
        success: false,
        message: "OTP verification service is not configured.",
      });
    }

    // 2. Allow email signup verification only
    if (type !== "email" || purpose !== "signup") {
      return res.status(400).json({
        success: false,
        message: "Email signup OTP verification is currently supported.",
      });
    }

    // 3. Normalize input
    const email = String(destination || "")
      .trim()
      .toLowerCase();

    const enteredOtp = String(otp || "").trim();

    // 4. Validate email and OTP format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (!/^\d{6}$/.test(enteredOtp)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit OTP.",
      });
    }

    // 5. Retrieve OTP record
    const key = `signup:email:${email}`;
    const record = otpStore.get(key);

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP.",
      });
    }

    // 6. Check expiration
    if (Date.now() >= record.expiresAt) {
      otpStore.delete(key);

      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
    }

    // 7. Prevent repeated verification after success
    if (record.verified) {
      return res.json({
        success: true,
        message: "Email already verified successfully.",
      });
    }

    // 8. Limit incorrect attempts
    if (record.attempts >= 5) {
      otpStore.delete(key);

      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Request a new OTP.",
      });
    }

    // 9. Hash the entered OTP
    record.attempts += 1;

    const enteredHash = hashOtp(
      enteredOtp,
      email,
      "signup"
    );

    // 10. Compare hashes safely
    const storedBuffer = Buffer.from(record.hash, "hex");
    const enteredBuffer = Buffer.from(enteredHash, "hex");

    const valid =
      storedBuffer.length === enteredBuffer.length &&
      crypto.timingSafeEqual(storedBuffer, enteredBuffer);

    if (!valid) {
      if (record.attempts >= 5) {
        otpStore.delete(key);

        return res.status(429).json({
          success: false,
          message: "Too many incorrect attempts. Request a new OTP.",
        });
      }

      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${5 - record.attempts} attempts remaining.`,
      });
    }

    // 11. Mark email as verified
    record.verified = true;

    otpStore.set(key, record);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });

  } catch (err) {
    console.error("OTP verification error:", err.message);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed.",
    });
  }
});
/* =========================
   OPENAI / OPENROUTER CLIENT
========================= */
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

/* =========================
   RAZORPAY 
========================= */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
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
/* =========================
   SIGNUP
========================= */

app.post("/signup", async (req, res) => {
  try {
    const {
      name,
      password,
      exam,
      className,
      city,
      phone,
      college,
    } = req.body;

    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    // Check email verification
    const verificationKey = `signup:email:${email}`;
    const verification = otpStore.get(verificationKey);

    if (
      !verification ||
      !verification.verified ||
      Date.now() > verification.expiresAt
    ) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email before signing up.",
      });
    }

    // Check existing account
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists. Please log in.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email,
      password: hashedPassword,
      exam,
      className,
      city,
      phone,
      college,
    });

    // Consume the verified OTP
    otpStore.delete(verificationKey);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        exam: user.exam,
        className: user.className,
        city: user.city,
        phone: user.phone,
        college: user.college,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);

    return res.status(500).json({
      success: false,
      message: "Signup failed.",
    });
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


    res.json({
  success: true,
  message: "Login successful",
  user: {
    id: user._id,

    name: user.name,
    email: user.email,

    exam: user.exam,
    className: user.className,

    city: user.city,
    phone: user.phone,
    college: user.college,

    profilePic: user.profilePic,
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
app.get("/dashboard", async (req, res) => {
  try {
    const user = await User.findOne();

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
   DOUBT (placeholder)
========================= */
app.post("/doubt", (req, res) => {
  const { question } = req.body;
  res.json({ success: true, question });
});

/* =========================
   PROFILE ROUTES
========================= */
app.get("/api/user/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    ).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

app.put("/api/user/profile/:id", async (req, res) => {
  try {
    const updatedUser =
      await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

app.post(
  "/api/user/upload-profile/:id",
  upload.single("profilePic"),
  async (req, res) => {
    try {
      const imageUrl =
        `/uploads/${req.file.filename}`;

      await User.findByIdAndUpdate(
        req.params.id,
        {
          profilePic: imageUrl,
        }
      );

      res.json({
        success: true,
        profilePic: imageUrl,
      });
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  }
);

/* =========================
   FILE UPLOAD -> NOTES
========================= */

// Upload PDF and associate it with a user
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Valid userId is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF",
      });
    }

    const note = await Note.create({
      title: req.file.originalname,
      file: `/uploads/${req.file.filename}`,
      size: Number((req.file.size / (1024 * 1024)).toFixed(2)),
      userId: userId,
    });

    res.status(201).json({
      success: true,
      note,
    });
  } catch (err) {
    console.log("Upload error:", err);

    res.status(500).json({
      success: false,
      error: "Upload failed",
    });
  }
});

// Fetch only the logged-in user's notes
app.get("/notes/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const notes = await Note.find({
      userId: userId,
    }).sort({ createdAt: -1 });

    res.json(notes);
  } catch (err) {
    console.log("Fetch notes error:", err);

    res.status(500).json({
      success: false,
      error: "Failed to fetch notes",
    });
  }
});

// Delete only a note belonging to the specified user
app.delete("/delete-note/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    const { id } = req.params;

    if (
      !userId ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid userId and note ID are required",
      });
    }

    const note = await Note.findOne({
      _id: id,
      userId: userId,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found or you do not own this note",
      });
    }

    await Note.deleteOne({ _id: note._id });

    res.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (err) {
    console.log("Delete note error:", err);

    res.status(500).json({
      success: false,
      error: "Delete failed",
    });
  }
});



/* =========================
   AI CHAT (ASK-AI)
========================= */
app.post("/ask-ai", async (req, res) => {
  try {
    const { question, history, chatId, temporary, userId } = req.body;

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
    You are a helpful AI tutor and friendly teacher.

Rules:
- Use markdown formatting
- For inline maths use: $...$
- For equations use: $$...$$
- Explain step by step
- use bullet points keep answer to the point and recheck 100 times before giving answer,
- Use examples and analogies
- For code, also specify language and explain the intution and algorithm 
- dont give only solution explain the intution.
-Always wrap programming code inside markdown code blocks.
`
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
   CALENDAR
========================= */
app.post("/add-event", async (req, res) => {
  try {
    const event = await Event.create(req.body);

    res.json({
      success: true,
      event,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
    });
  }
});

app.get("/events/:userId", async (req, res) => {
  try {
    const events = await Event.find({
      userId: req.params.userId,
    }).sort({ date: 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch events",
    });
  }
});

app.delete("/event/:id", async (req, res) => {
  await Event.findByIdAndDelete(
    req.params.id
  );

  res.json({
    success: true,
  });
});

//DOUBT SECTION

app.post("/add-doubt", async (req, res) => {
  try {
    const { userId, question } = req.body;

    const doubt = await Doubt.create({
      userId,
      question,
    });

    res.json({
      success: true,
      doubt,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
    });
  }
});

app.get("/doubts/:userId", async (req, res) => {
  try {
    const doubts = await Doubt.find({
      userId: req.params.userId,
    }).sort({
      createdAt: -1,
    });

    res.json(doubts);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Failed to fetch doubts",
    });
  }
});

app.delete("/doubt/:id", async (req, res) => {
  try {
    await Doubt.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
    });
  }
});

//google login

app.post("/google-login", async (req, res) => {
  try {
    const {
      name,
      email,
      profilePic,
    } = req.body;

    let user = await User.findOne({
  email,
});

if (!user) {
  user = await User.create({
    name,
    email,
    password: "",
    profilePic,
  });
} else if (profilePic && !user.profilePic) {
  user.profilePic = profilePic;
  await user.save();
}

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        exam: user.exam,
        className: user.className,
        city: user.city,
        phone: user.phone,
        college: user.college,
      },
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Google login failed",
    });
  }
});


//PROGRESS

app.get("/progress/:userId", async (req, res) => {
  try {
    const doubtsSolved = await Doubt.countDocuments({
      userId: req.params.userId,
    });

    const notesCreated = await Note.countDocuments();

    const totalChats = await Chat.countDocuments({
      userId: req.params.userId,
    });

    const streak =
      doubtsSolved > 0
        ? Math.min(doubtsSolved, 30)
        : 0;

    res.json({
      streak,
      doubtsSolved,
      notesCreated,
      totalChats,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch progress",
    });
  }
});

/* =========================
   PLANS
========================= */

app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });

    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});




/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// redeploy
