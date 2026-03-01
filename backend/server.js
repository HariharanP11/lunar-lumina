require("dotenv").config();

if (!process.env.GROQ_API_KEY) {
  console.error("\n❌ GROQ_API_KEY is missing!");
  console.error("Create a .env file in the backend folder with:");
  console.error("  GROQ_API_KEY=your_key_here\n");
  console.error("Get a free API key at: https://console.groq.com/keys\n");
  process.exit(1);
}

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Groq = require("groq-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Gemini client (optional)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || null;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Simple in-memory rate limiter for /ai-tutor (max 5 requests/minute per IP)
const aiTutorRateLimit = new Map();
const AI_TUTOR_WINDOW_MS = 60 * 1000;
const AI_TUTOR_MAX_REQUESTS = 5;
app.post("/generate-quiz", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const difficulty = req.body.difficulty || "medium";
    const syllabusText = req.file.buffer.toString();

    const prompt = `
Generate 10 ${difficulty} level multiple choice questions 
from this syllabus:

${syllabusText}

Return ONLY valid JSON in this format:
[
  {
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "one of the options exactly"
  }
]
Only JSON. No explanation.
`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "user", content: prompt }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content;

    // Extract JSON safely
    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]") + 1;

    if (jsonStart === -1 || jsonEnd === -1) {
      return res.status(500).json({ error: "AI did not return valid JSON" });
    }

    const jsonString = text.slice(jsonStart, jsonEnd);
    const questions = JSON.parse(jsonString);

    res.json(questions);

  } catch (error) {
    console.error("GROQ ERROR:", error);
    res.status(500).json({ error: "AI generation failed" });
  }
});

app.post("/analyze-performance", async (req, res) => {
  try {
    const { currentQuiz, previousQuizzes } = req.body;

    if (!currentQuiz) {
      return res.status(400).json({ error: "Missing currentQuiz data" });
    }

    const prompt = `
You are an Advanced AI Learning Intelligence Engine.

Analyze this student's quiz performance and return ONLY valid JSON.

Input:
${JSON.stringify({ currentQuiz, previousQuizzes }, null, 2)}

Your tasks:
1. Calculate topic-wise accuracy percentage.
2. Detect weak (<50%), moderate (50-75%), and strong (>75%) topics.
3. Analyze trend using previous quiz scores (improving / stagnating / declining).
4. Predict learning velocity (fast learner / moderate learner / at-risk learner).
5. Detect early stagnation if performance plateaued for 3 attempts.
6. Decide next difficulty:
   - If improving consistently and score > 75% -> increase
   - If stagnating -> keep same
   - If declining -> reduce
7. Generate a 3-day study plan. For studyPlan.day1, studyPlan.day2, studyPlan.day3 use STRICT rules:
   - Use clear, specific concept names only (e.g. Loops, Recursion, CPU Scheduling, Deadlock, Graphs, Dynamic Programming). Do NOT use vague phrases like "improve basics", "revise fundamentals", "strengthen understanding".
   - Each day's string must use this EXACT structure (with newlines):
     Focus Areas:
     - Concept Name
     - Concept Name
     Reinforcement:
     - Concept Name
     Maintain Strength:
     - Concept Name
   - Do NOT generate any links. Do NOT add explanations. Only output the structured study plan with concept names.
8. Return structured JSON.

Return ONLY this JSON format, no explanation:
{
  "performanceSummary": "string",
  "topicAccuracy": { "topicName": number },
  "weakTopics": ["string"],
  "moderateTopics": ["string"],
  "strongTopics": ["string"],
  "trendAnalysis": "string",
  "learningVelocity": "string",
  "riskLevel": "Low | Medium | High",
  "recommendedDifficulty": "string",
  "studyPlan": {
    "day1": "Focus Areas:\\n- Concept\\n- Concept\\nReinforcement:\\n- Concept\\nMaintain Strength:\\n- Concept",
    "day2": "same structure",
    "day3": "same structure"
  },
  "improvementStrategies": ["string", "string", "string"],
  "motivation": "string"
}
`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
    });

    const text = completion.choices[0].message.content;

    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}") + 1;

    if (jsonStart === -1 || jsonEnd === 0) {
      return res.status(500).json({ error: "AI did not return valid JSON" });
    }

    const analysis = JSON.parse(text.slice(jsonStart, jsonEnd));
    res.json(analysis);

  } catch (error) {
    console.error("ANALYZE ERROR:", error);
    res.status(500).json({ error: "Analysis failed" });
  }
});

app.post("/explain-wrong", async (req, res) => {
  try {
    const { wrongAnswers } = req.body;

    if (!wrongAnswers || wrongAnswers.length === 0) {
      return res.json({ explanations: [] });
    }

    const prompt = `
For each question below, the student chose the wrong answer. Explain briefly why the correct answer is right and why their answer is wrong. Return ONLY a JSON array of explanation strings, one per question. No extra text.

Questions:
${wrongAnswers.map((w, i) => `${i + 1}. Question: "${w.question}" | Student answered: "${w.userAnswer}" | Correct answer: "${w.correctAnswer}"`).join("\n")}

Return ONLY a JSON array like: ["explanation1", "explanation2", ...]
`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
    });

    const text = completion.choices[0].message.content;

    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]") + 1;

    if (jsonStart === -1 || jsonEnd === 0) {
      return res.status(500).json({ error: "AI did not return valid JSON" });
    }

    const explanations = JSON.parse(text.slice(jsonStart, jsonEnd));
    res.json({ explanations });

  } catch (error) {
    console.error("EXPLAIN ERROR:", error);
    res.status(500).json({ error: "Explanation failed" });
  }
});

app.post("/ai-tutor", async (req, res) => {
  try {
    if (!genAI || !GEMINI_API_KEY) {
      return res
        .status(503)
        .json({ reply: "AI Tutor is temporarily unavailable." });
    }

    const now = Date.now();
    const key = req.ip || "global";
    const entry = aiTutorRateLimit.get(key) || {
      count: 0,
      windowStart: now,
    };

    if (now - entry.windowStart > AI_TUTOR_WINDOW_MS) {
      entry.count = 0;
      entry.windowStart = now;
    }

    if (entry.count >= AI_TUTOR_MAX_REQUESTS) {
      aiTutorRateLimit.set(key, entry);
      return res
        .status(429)
        .json({ reply: "AI Tutor is temporarily unavailable." });
    }

    entry.count += 1;
    aiTutorRateLimit.set(key, entry);

    const { userMessage, weakTopics, learningVelocity, riskLevel } = req.body || {};

    if (!userMessage || typeof userMessage !== "string") {
      return res
        .status(400)
        .json({ reply: "Please provide a valid question for the AI tutor." });
    }

    const weakText = Array.isArray(weakTopics) ? weakTopics.join(", ") : "None";
    const velocityText =
      typeof learningVelocity === "number"
        ? String(learningVelocity)
        : "Unknown";
    const riskText = typeof riskLevel === "string" ? riskLevel : "Unknown";

    const prompt = `
You are an academic AI tutor.
The student learning profile:
Weak Topics: ${weakText}
Learning Velocity: ${velocityText}
Risk Level: ${riskText}

Student Question:
${userMessage}

Provide:
- Clear explanation
- Simple language
- Practical example
- Short response (max 200 words)
- No hallucinated links
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = (response && response.text && response.text()) || "";

    const words = text.split(/\s+/);
    if (words.length > 200) {
      text = words.slice(0, 200).join(" ");
    }

    return res.json({ reply: text.trim() || "AI Tutor is temporarily unavailable." });
  } catch (error) {
    console.error("AI TUTOR ERROR:", error);
    return res
      .status(503)
      .json({ reply: "AI Tutor is temporarily unavailable." });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
