const express = require("express");
const router = express.Router();
const {
  generateQuestions,
  evaluateAnswer,
  finalizeSession,
  getSession,
  getAllSessions,
  deleteSession,
} = require("../controllers/interviewController");

router.post("/generate-questions", generateQuestions);
router.post("/evaluate-answer", evaluateAnswer);
router.post("/finalize-session", finalizeSession);
router.get("/sessions", getAllSessions);
router.get("/sessions/:sessionId", getSession);
router.delete("/sessions/:sessionId", deleteSession);

module.exports = router;
