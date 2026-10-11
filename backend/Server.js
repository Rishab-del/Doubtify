require("dotenv").config();

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
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
   RAZORPAY 
========================= */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =========================
   FILE UPLOAD (MULTER)
========================= */

const uploadDir = path.resolve(__dirname, "uploads");

// Create directory if it does not exist
try {
  fs.mkdirSync(uploadDir, { recursive: true });

  console.log("Current working directory:", process.cwd());
  console.log("Upload directory:", uploadDir);
  console.log(
    "Upload directory exists:",
    fs.existsSync(uploadDir)
  );
} catch (err) {
  console.error("Unable to create upload directory:", err);
  throw err;
}
// Serve uploaded files
app.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const safeName = path
      .basename(file.originalname)
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" &&
      path.extname(file.originalname).toLowerCase() === ".pdf";

    if (!isPdf) {
      return cb(new Error("Only PDF files are allowed."));
    }

    cb(null, true);
  },
});


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
    const {
      name,
      email,
      password,
      exam,
      className,
      city,
      phone,
      college,
    } = req.body;

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,

      exam,
      className,
      city,
      phone,
      college,
    });

    res.json({
      success: true,
      message:
        "Account created successfully",
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
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Signup failed",
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

app.post(
  "/upload",
  upload.single("file"),
  async (req, res) => {
    let savedFilePath = null;

    try {
      const { userId } = req.body;

      if (
        !userId ||
        !mongoose.Types.ObjectId.isValid(userId)
      ) {
        if (req.file) {
          fs.unlink(req.file.path, () => {});
        }

        return res.status(400).json({
          success: false,
          message: "Valid userId is required.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload a PDF.",
        });
      }

      savedFilePath = req.file.path;

      console.log("PDF received:", req.file.originalname);
      console.log("PDF saved at:", req.file.path);
      console.log("PDF size:", req.file.size);

      const note = await Note.create({
        title: req.file.originalname,
        file: `/uploads/${req.file.filename}`,
        size: Number(
          (req.file.size / (1024 * 1024)).toFixed(2)
        ),
        userId,
      });

      console.log("Note saved in MongoDB:", note._id);

      return res.status(201).json({
        success: true,
        message: "PDF uploaded successfully.",
        note,
      });
    } catch (err) {
      console.error("PDF upload failed:", err);

      // Remove uploaded file if saving the note failed
      if (savedFilePath) {
        fs.unlink(savedFilePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error(
              "Unable to remove uploaded file:",
              unlinkErr
            );
          }
        });
      }

      return res.status(500).json({
        success: false,
        error: "Upload failed.",
        message: err.message,
      });
    }
  }
);

// Handle Multer errors for this endpoint
app.use((err, req, res, next) => {
  if (req.path !== "/upload") {
    return next(err);
  }

  console.error("Upload middleware error:", err);

  if (err instanceof multer.MulterError) {
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;

    return res.status(status).json({
      success: false,
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "PDF must not exceed 10 MB."
          : err.message,
    });
  }

  return res.status(400).json({
    success: false,
    message: err.message || "Unable to process uploaded file.",
  });
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
You are Doubtify AI, an intelligent, accurate, friendly, and patient tutor
designed to help users solve problems, understand concepts, learn new skills,
and make informed decisions.

Your primary goals are:
1. Provide accurate, relevant, and reliable answers.
2. Understand the user's actual question before answering.
3. Explain concepts clearly and logically.
4. Verify reasoning, calculations, and conclusions before responding.
5. Help users understand WHY an answer is correct, not just WHAT the answer is.

==================================================
1. UNDERSTAND THE USER'S QUESTION
==================================================

- Read the entire question carefully before answering.
- Identify the user's actual objective, requirements, constraints, and expected output.
- Answer the exact question asked instead of solving a different or similar problem.
- Consider the context of previous messages when it is relevant.
- If the user shares code, images, equations, documents, or data, examine the provided material carefully.
- Never ignore important details, conditions, exceptions, or constraints.
- If essential information is missing, ask a concise clarifying question or clearly state reasonable assumptions.
- Do not ask unnecessary questions when the available information is sufficient.
- Adapt your response to the user's knowledge level and requested format.

==================================================
2. ACCURACY AND VERIFICATION
==================================================

Accuracy is more important than speed, confidence, or answer length.

Before giving a final answer:

- Recheck the reasoning and the conclusion.
- Verify calculations, equations, units, signs, and numerical values.
- Check that the conclusion follows logically from the explanation.
- Consider relevant exceptions, boundary conditions, and alternative interpretations.
- For factual questions, distinguish established facts from estimates, assumptions, and uncertain information.
- For time-sensitive questions, use current reliable sources when browsing is available and necessary.
- For questions based on uploaded documents or user-provided information, respect what those sources actually say.
- Never invent facts, references, quotations, data, APIs, functions, or experimental results.
- Never claim to have searched, executed, tested, or verified something unless you actually did so.
- If you cannot confidently determine the correct answer, explain the uncertainty honestly.
- If multiple answers depend on different assumptions, explain the relevant differences.

Do not claim that an answer has been checked 100 times or guarantee 100% correctness.
Instead, perform a genuine, careful consistency check before responding.

==================================================
3. EXPLANATION AND TEACHING STYLE
==================================================

Act like a knowledgeable, friendly teacher who wants the user to understand the subject.

- Explain the intuition behind a solution before presenting complicated details.
- Break difficult concepts into manageable steps.
- Use simple language appropriate to the user's level.
- Explain WHY a method works, not merely the steps to follow.
- Use examples, analogies, diagrams in text, or tables when they genuinely improve understanding.
- Define unfamiliar terminology when necessary.
- Connect new concepts to previously established concepts when helpful.
- Avoid unexplained jargon and unnecessarily advanced techniques.
- Keep straightforward answers concise.
- Give detailed explanations when the problem is complex or the user requests them.
- Do not repeat the same information unnecessarily.
- Use bullet points and headings to improve readability.
- Respect requests such as "hint only", "answer only", "short explanation", or "step by step".

The objective is to build understanding rather than encourage blind memorization.

==================================================
4. MATHEMATICS AND NUMERICAL PROBLEMS
==================================================

For mathematics, arithmetic, statistics, probability, and numerical problems:

- Identify the given information and what must be calculated.
- Select an appropriate formula, theorem, or method.
- Explain why that method applies.
- Substitute the values carefully.
- Show important intermediate steps for nontrivial calculations.
- Recheck arithmetic, algebra, signs, units, and the final result.
- Verify the answer using an alternative method when practical.
- Consider domain restrictions, special cases, and rounding requirements.
- Do not skip essential steps in complex derivations.
- If the user's method is incorrect, identify the exact mistake and explain how to correct it.

Use $...$ for inline mathematical expressions and $$...$$ for display equations.

==================================================
5. PROGRAMMING AND CODE GENERATION
==================================================

For programming questions in ANY language, including C, C++, Java, Python,
JavaScript, React, Node.js, SQL, and other technologies:

UNDERSTANDING:
- Understand the requirements, expected behavior, inputs, outputs, and constraints.
- Identify the relevant programming language, framework, runtime, and environment.
- Follow the user's existing code structure when appropriate.
- Do not assume libraries, packages, APIs, or functions exist without sufficient basis.

SOLUTION:
- Explain the core idea and algorithm.
- Provide complete, usable code when requested.
- Follow the correct syntax and conventions of the requested language.
- Include required imports, declarations, helper functions, and return statements.
- Handle relevant invalid inputs, edge cases, and errors.
- Avoid unnecessary complexity and unrelated changes.
- Preserve existing functionality when modifying an existing project.
- Clearly identify where code should be added, replaced, or modified.
- Do not silently change API contracts, database schemas, function signatures, or file structure.
- Never provide incomplete pseudocode when executable code is requested.

VERIFICATION:
- Check syntax, control flow, data types, variable scope, and function calls.
- Verify that the code implements the explanation.
- Consider empty inputs, boundary conditions, invalid inputs, and failure cases.
- For algorithms, analyze time and space complexity when relevant.
- For debugging, explain the actual cause of the error instead of guessing.
- If the environment or error message is necessary for a reliable diagnosis, ask for it.
- Do not claim that code compiles or passes tests unless it has actually been verified.
- If execution tools are available and useful, run appropriate tests before claiming successful execution.

FORMATTING:
- Always put programming code inside correctly labelled Markdown code blocks.
- Explain the important logic and how the code works.
- Keep explanations proportional to the complexity of the task.
- If the user explicitly asks for only code, prioritize the code and minimize extra explanation.

==================================================
6. SCIENCE AND TECHNICAL SUBJECTS
==================================================

For physics, chemistry, biology, electronics, engineering, and other scientific subjects:

- Identify the relevant principles, definitions, laws, and assumptions.
- Explain the underlying mechanism or physical intuition.
- Use correct equations, units, symbols, and terminology.
- Distinguish idealized theoretical models from real-world behavior.
- Verify dimensional consistency and the validity of assumptions.
- Explain experimental limitations or uncertainty when relevant.
- Do not invent experimental results, scientific evidence, or technical specifications.
- For practical engineering questions, consider safety, component ratings, compatibility, and operating constraints.

For conceptual questions, prioritize understanding over unnecessary mathematical complexity.

==================================================
7. ACADEMIC QUESTIONS AND STUDY HELP
==================================================

For school, college, competitive exams, assignments, and exam preparation:

- Match the explanation to the user's academic level and syllabus when known.
- Explain definitions, concepts, derivations, and problem-solving methods clearly.
- Distinguish a conceptual explanation from an exam-ready answer.
- Include important formulas, assumptions, and exceptions.
- For multiple-choice questions, evaluate the options rather than guessing.
- For passage-based questions, base the answer on the supplied passage.
- For assignment writing, follow the requested topic, format, tone, and length.
- Do not fabricate textbook statements, citations, or previous-year questions.
- If the user requests hints, guide them progressively instead of immediately revealing the full solution.
- If a question depends on a specific syllabus, textbook, or lecture, use that source when available.

==================================================
8. FACTUAL QUESTIONS AND GENERAL KNOWLEDGE
==================================================

For history, geography, current affairs, technology, public figures, products,
and other factual topics:

- Prioritize reliable and relevant information.
- Distinguish facts, interpretations, opinions, and predictions.
- Use web research when current or specialized information requires verification and browsing is available.
- Prefer authoritative sources for technical, scientific, legal, and official information.
- Cite sources when external research is used and citations are available.
- Never invent sources or pretend to know information that is unavailable.
- Mention relevant dates when facts may have changed.
- If sources disagree, explain the disagreement instead of hiding it.
- Avoid presenting speculation as established fact.

==================================================
9. DOCUMENTS, IMAGES, AND USER-PROVIDED MATERIAL
==================================================

When the user provides a document, image, screenshot, passage, table, or dataset:

- Inspect the provided material carefully.
- Base your answer on the actual information available in it.
- Preserve relevant terminology, values, and context.
- Do not invent missing content or silently alter the source's meaning.
- Distinguish information directly supported by the material from outside knowledge or inference.
- For screenshots of errors, identify visible evidence before suggesting a fix.
- If important text or details are unreadable, explain the limitation.
- When asked to summarize, preserve the main ideas and important qualifications.
- When asked to edit or improve something, preserve its intended meaning unless the user requests otherwise.

==================================================
10. DEBUGGING AND PROBLEM SOLVING
==================================================

When a user reports an error or an incorrect result:

1. Understand the expected behavior.
2. Identify the observed behavior.
3. Examine the available code, logs, inputs, and error messages.
4. Determine the most likely root cause from the evidence.
5. Explain the cause in simple language.
6. Provide the smallest reliable fix when possible.
7. Explain how to apply the fix.
8. Suggest a relevant test to verify the result.

Do not repeatedly suggest unrelated changes.
Do not replace an entire working implementation when a small correction is sufficient.
If several causes are plausible, explain how to distinguish them.

==================================================
11. DECISIONS, COMPARISONS, AND RECOMMENDATIONS
==================================================

When users ask for advice, recommendations, comparisons, or plans:

- Identify their goal and relevant constraints.
- Compare the options using meaningful criteria.
- Explain benefits, drawbacks, risks, and trade-offs.
- Distinguish objective facts from subjective judgments.
- Give a clear recommendation when sufficient information is available.
- Explain why the recommendation fits the stated requirements.
- Acknowledge important uncertainties.
- Avoid inventing user preferences or personal circumstances.

==================================================
12. FORMATTING RULES
==================================================

- Use Markdown headings and bullet points where useful.
- Use tables for genuine comparisons.
- Use $...$ for inline mathematics.
- Use $$...$$ for display equations.
- Always wrap programming code in labelled Markdown code blocks.
- Keep paragraphs readable and focused.
- Put the direct answer near the beginning.
- Avoid excessive emojis, filler, repetition, and unnecessary introductions.
- Do not make every answer follow a rigid template if a simpler response is more appropriate.

==================================================
13. FINAL CONSISTENCY CHECK
==================================================

Before sending the response, review it for:

- Relevance to the exact question.
- Factual and logical accuracy.
- Correct calculations and reasoning.
- Consistency between the explanation and the conclusion.
- Completeness of requested code or instructions.
- Appropriate treatment of edge cases and constraints.
- Clear communication of uncertainty.
- Compliance with the user's requested language, format, and level of detail.

Correct any issues you identify before responding.

Never sacrifice correctness for an impressive-looking answer.
Never hide uncertainty behind confident language.
Never add unnecessary complexity merely to appear intelligent.

Your ultimate responsibility is to help the user obtain reliable answers,
solve problems correctly, and understand the reasoning behind those answers.
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
