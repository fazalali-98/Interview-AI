const pool = require("../config/db");

// Groq API call using fetch
const askGroq = async (prompt) => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data.choices[0].message.content.trim();
};

const generateQuestions = async (req, res) => {
  const { role, resume } = req.body;
  if (!role) return res.status(400).json({ error: "Role is required" });

  const truncatedResume = resume ? resume.substring(0, 2000) : "";

  try {
    let prompt = "";
    if (truncatedResume && truncatedResume.trim().length > 50) {
      prompt = `You are a senior technical interviewer at a top tech company.
The candidate is applying for a ${role} position. Here is their resume/background:
---
${truncatedResume}
---
Generate exactly 5 MCQ interview questions tailored to this candidate's background and the ${role} role.
Mix technical and behavioral questions. Each question must have exactly 4 options and one correct answer.
Respond ONLY with a valid JSON array of 5 objects. No explanation, no markdown, no backticks, just the raw array.
Each object must follow this exact format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": "Option A"
  }
]`;
    } else {
      prompt = `You are a senior technical interviewer at a top tech company.
Generate exactly 5 MCQ interview questions for a ${role} developer position.
Mix 3 technical questions and 2 behavioral questions. Make them realistic and challenging.
Each question must have exactly 4 options and one correct answer.
Respond ONLY with a valid JSON array of 5 objects. No explanation, no markdown, no backticks, just the raw array.
Each object must follow this exact format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": "Option A"
  }
]`;
    }

    let rawText = await askGroq(prompt);
    console.log("RAW AI RESPONSE (generateQuestions):", rawText);

    rawText = rawText.replace(/```json|```/g, "").trim();

    // Robustly extract JSON array even if AI adds text around it
    const match = rawText.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array found in AI response: " + rawText);
    const questions = JSON.parse(match[0]);

    if (!Array.isArray(questions) || questions.length !== 5) {
      throw new Error("Invalid questions format from AI");
    }

    // Validate each question has required fields
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question || !Array.isArray(questions[i].options) || questions[i].options.length !== 4 || !questions[i].correct) {
        throw new Error(`Question ${i + 1} is missing required fields`);
      }
    }

    const [result] = await pool.execute(
      "INSERT INTO interview_sessions (role, resume_used, total_questions) VALUES (?, ?, 5)",
      [role, truncatedResume && truncatedResume.trim().length > 50 ? 1 : 0]
    );
    const sessionId = result.insertId;

    for (let i = 0; i < questions.length; i++) {
      await pool.execute(
        "INSERT INTO interview_questions (session_id, question_number, question) VALUES (?, ?, ?)",
        [sessionId, i + 1, questions[i].question]
      );
    }

    res.json({ sessionId, questions });
  } catch (err) {
    console.error("generateQuestions error:", err);
    res.status(500).json({ error: "Failed to generate questions", details: err.message });
  }
};

const evaluateAnswer = async (req, res) => {
  const { sessionId, questionNumber, question, answer, role } = req.body;
  if (!question || !answer || !sessionId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const prompt = `You are a strict but fair technical interviewer evaluating a ${role} developer candidate.
Question asked: "${question}"
Candidate's answer: "${answer}"
Evaluate this answer and respond ONLY with a valid JSON object. No markdown, no backticks, no explanation outside the JSON:
{
  "score": <integer from 0 to 10>,
  "verdict": "<one of: Excellent | Good | Average | Needs Improvement | Poor>",
  "strengths": "<1-2 sentences on what was good, or None if poor>",
  "weaknesses": "<1-2 sentences on what was missing or wrong>",
  "ideal_answer": "<2-3 sentences on what a great answer would include>",
  "tip": "<one actionable improvement tip>"
}`;

    let rawText = await askGroq(prompt);
    console.log("RAW AI RESPONSE (evaluateAnswer):", rawText);

    rawText = rawText.replace(/```json|```/g, "").trim();

    // Robustly extract JSON object even if AI adds text around it
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in AI response: " + rawText);
    const feedback = JSON.parse(match[0]);

    await pool.execute(
      "UPDATE interview_questions SET user_answer = ?, ai_feedback = ?, score = ? WHERE session_id = ? AND question_number = ?",
      [answer, JSON.stringify(feedback), feedback.score, sessionId, questionNumber]
    );

    res.json({ feedback });
  } catch (err) {
    console.error("evaluateAnswer error:", err.message);
    res.status(500).json({ error: "Failed to evaluate answer", details: err.message });
  }
};

const finalizeSession = async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: "Session ID required" });

  try {
    const [rows] = await pool.execute(
      "SELECT score FROM interview_questions WHERE session_id = ?",
      [sessionId]
    );
    if (!rows.length) return res.status(404).json({ error: "Session not found" });

    const total = rows.reduce((sum, r) => sum + (r.score || 0), 0);
    const avg = (total / rows.length).toFixed(2);

    await pool.execute("UPDATE interview_sessions SET score = ? WHERE id = ?", [avg, sessionId]);
    res.json({ sessionId, averageScore: parseFloat(avg), totalQuestions: rows.length });
  } catch (err) {
    console.error("finalizeSession error:", err.message);
    res.status(500).json({ error: "Failed to finalize session" });
  }
};

const getSession = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const [session] = await pool.execute("SELECT * FROM interview_sessions WHERE id = ?", [sessionId]);
    if (!session.length) return res.status(404).json({ error: "Session not found" });

    const [questions] = await pool.execute(
      "SELECT * FROM interview_questions WHERE session_id = ? ORDER BY question_number",
      [sessionId]
    );

    const questionsWithFeedback = questions.map((q) => ({
      ...q,
      ai_feedback: q.ai_feedback ? JSON.parse(q.ai_feedback) : null,
    }));

    res.json({ session: session[0], questions: questionsWithFeedback });
  } catch (err) {
    console.error("getSession error:", err.message);
    res.status(500).json({ error: "Failed to fetch session" });
  }
};

const getAllSessions = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM session_summary ORDER BY created_at DESC LIMIT 50"
    );
    res.json({ sessions: rows });
  } catch (err) {
    console.error("getAllSessions error:", err.message);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

const deleteSession = async (req, res) => {
  const { sessionId } = req.params;
  try {
    await pool.execute("DELETE FROM interview_sessions WHERE id = ?", [sessionId]);
    res.json({ message: "Session deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete session" });
  }
};

module.exports = { generateQuestions, evaluateAnswer, finalizeSession, getSession, getAllSessions, deleteSession };