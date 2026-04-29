import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { evaluateAnswer, finalizeSession } from "../api";

const verdictConfig = {
  Excellent: { color: "var(--green)", bg: "var(--green-dim)", icon: "🏆" },
  Good: { color: "var(--green)", bg: "var(--green-dim)", icon: "✅" },
  Average: { color: "var(--yellow)", bg: "var(--yellow-dim)", icon: "📊" },
  "Needs Improvement": { color: "var(--yellow)", bg: "var(--yellow-dim)", icon: "📝" },
  Poor: { color: "var(--red)", bg: "var(--red-dim)", icon: "⚠️" },
};

export default function Interview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId, questions, role, mode } = location.state || {};

  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [mcqResult, setMcqResult] = useState(null); // { correct: bool, correctAnswer: string }
  const [allFeedback, setAllFeedback] = useState([]);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");
  const [finishing, setFinishing] = useState(false);

  if (!questions || !sessionId) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <p style={{ color: "var(--text2)" }}>No interview session found.</p>
        <button className="btn btn-primary" onClick={() => navigate("/")} style={{ marginTop: "16px" }}>← Go Home</button>
      </div>
    );
  }

  const isMCQ = mode === "mcq";
  const progress = (current / questions.length) * 100;
  const currentQ = questions[current];
  const questionText = currentQ && typeof currentQ === "object" ? currentQ.question : currentQ;
  const options = currentQ && typeof currentQ === "object" ? (currentQ.options || []) : [];
  const correctAnswer = currentQ && typeof currentQ === "object" ? currentQ.correct : null;

  // MCQ: check answer immediately without calling AI for feedback details
  const handleMCQSubmit = async () => {
    if (!answer) return;
    setEvaluating(true);
    setError("");
    const isCorrect = answer === correctAnswer;
    const score = isCorrect ? 10 : 0;

    // Still save to DB via evaluateAnswer so scores persist
    try {
      await evaluateAnswer(sessionId, current + 1, questionText, answer, role);
    } catch {
      // non-blocking — don't stop the flow
    }

    const simpleFeedback = {
      score,
      verdict: isCorrect ? "Excellent" : "Poor",
      strengths: isCorrect ? "Correct answer selected." : "None",
      weaknesses: isCorrect ? "None" : "Wrong option selected.",
      ideal_answer: correctAnswer,
      tip: "",
    };

    setMcqResult({ correct: isCorrect, correctAnswer });
    setFeedback(simpleFeedback);
    setAllFeedback((prev) => [...prev, { question: questionText, answer, feedback: simpleFeedback, correct: isCorrect }]);
    setEvaluating(false);
  };

  // Theory: call AI for full feedback
  const handleTheorySubmit = async () => {
    if (!answer.trim()) return;
    setEvaluating(true);
    setError("");
    try {
      const res = await evaluateAnswer(sessionId, current + 1, questionText, answer, role);
      const fb = res.data.feedback;
      setFeedback(fb);
      setAllFeedback((prev) => [...prev, { question: questionText, answer, feedback: fb }]);
    } catch {
      setError("Failed to evaluate. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = async () => {
    if (current + 1 >= questions.length) {
      setFinishing(true);
      try {
        await finalizeSession(sessionId);
        navigate(`/results/${sessionId}`, { state: { allFeedback: [...allFeedback], role, mode } });
      } catch {
        setError("Failed to finalize session.");
        setFinishing(false);
      }
    } else {
      setCurrent((p) => p + 1);
      setAnswer("");
      setFeedback(null);
      setMcqResult(null);
    }
  };

  const vc = feedback ? (verdictConfig[feedback.verdict] || verdictConfig["Average"]) : null;

  return (
    <div style={{ maxWidth: "780px", margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <span className="tag tag-accent">{role}</span>
          <span style={{
            padding: "4px 10px", borderRadius: "20px", fontSize: "11px",
            fontFamily: "Syne, sans-serif", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.06em",
            background: isMCQ ? "rgba(61,214,140,0.12)" : "rgba(245,197,66,0.12)",
            color: isMCQ ? "var(--green)" : "var(--yellow)",
            border: isMCQ ? "1px solid rgba(61,214,140,0.3)" : "1px solid rgba(245,197,66,0.3)",
          }}>
            {isMCQ ? "🔘 MCQ" : "✍️ Theory"}
          </span>
        </div>
        <div style={{ color: "var(--text2)", fontSize: "14px", fontFamily: "Syne, sans-serif", fontWeight: 600 }}>
          Question {current + 1} of {questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: "4px", background: "var(--surface3)", borderRadius: "2px", marginBottom: "40px", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${progress}%`,
          background: "linear-gradient(90deg, var(--accent), var(--accent2))",
          borderRadius: "2px", transition: "width 0.5s ease",
        }} />
      </div>

      {/* Question Card */}
      <div className="card" style={{ marginBottom: "24px", borderColor: "var(--border2)" }}>
        <div style={{ color: "var(--text3)", fontSize: "12px", fontFamily: "Syne, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>
          Q{current + 1}
        </div>
        <p style={{ fontSize: "19px", fontWeight: 500, lineHeight: 1.55, color: "var(--text)" }}>
          {questionText}
        </p>
      </div>

      {/* ── MCQ MODE ── */}
      {isMCQ && !feedback && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
            {options.map((option, idx) => {
              const isSelected = answer === option;
              return (
                <label
                  key={idx}
                  style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "14px 18px",
                    border: `2px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: "var(--radius-sm)",
                    background: isSelected ? "rgba(124,106,247,0.08)" : "var(--surface2)",
                    cursor: evaluating ? "not-allowed" : "pointer",
                    transition: "border-color 0.2s, background 0.2s",
                    opacity: evaluating ? 0.6 : 1,
                  }}
                >
                  <input
                    type="radio"
                    name={`mcq-${current}`}
                    value={option}
                    checked={isSelected}
                    onChange={() => !evaluating && setAnswer(option)}
                    disabled={evaluating}
                    style={{ width: "18px", height: "18px", accentColor: "var(--accent)", cursor: "pointer", flexShrink: 0 }}
                  />
                  <span style={{ fontSize: "15px", color: "var(--text)", lineHeight: 1.5 }}>{option}</span>
                </label>
              );
            })}
          </div>
          {error && (
            <div style={{ padding: "12px 16px", background: "var(--red-dim)", border: "1px solid rgba(240,98,106,0.3)", borderRadius: "var(--radius-sm)", color: "var(--red)", marginBottom: "16px" }}>
              {error}
            </div>
          )}
          <button
            className="btn btn-primary"
            onClick={handleMCQSubmit}
            disabled={!answer || evaluating}
            style={{ width: "100%", justifyContent: "center", padding: "15px" }}
          >
            {evaluating ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Checking…</> : "Submit Answer →"}
          </button>
        </>
      )}

      {/* MCQ Result */}
      {isMCQ && feedback && mcqResult && (
        <div style={{ animation: "fadeUp 0.4s ease" }}>
          {/* Show all options with correct/wrong highlight */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
            {options.map((option, idx) => {
              const isChosen = option === answer;
              const isCorrect = option === correctAnswer;
              let borderColor = "var(--border)";
              let bg = "var(--surface2)";
              let badge = null;

              if (isCorrect) { borderColor = "var(--green)"; bg = "var(--green-dim)"; badge = "✓ Correct"; }
              else if (isChosen && !isCorrect) { borderColor = "var(--red)"; bg = "var(--red-dim)"; badge = "✗ Your Answer"; }

              return (
                <div key={idx} style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "14px 18px",
                  border: `2px solid ${borderColor}`,
                  borderRadius: "var(--radius-sm)",
                  background: bg,
                }}>
                  <span style={{ fontSize: "15px", color: "var(--text)", flex: 1, lineHeight: 1.5 }}>{option}</span>
                  {badge && (
                    <span style={{
                      fontSize: "12px", fontFamily: "Syne, sans-serif", fontWeight: 700,
                      color: isCorrect ? "var(--green)" : "var(--red)",
                    }}>{badge}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Big correct/wrong banner */}
          <div style={{
            display: "flex", alignItems: "center", gap: "16px",
            padding: "20px 24px",
            background: mcqResult.correct ? "var(--green-dim)" : "var(--red-dim)",
            border: `1px solid ${mcqResult.correct ? "rgba(61,214,140,0.4)" : "rgba(240,98,106,0.4)"}`,
            borderRadius: "var(--radius)", marginBottom: "24px",
          }}>
            <div style={{ fontSize: "36px" }}>{mcqResult.correct ? "🎉" : "❌"}</div>
            <div>
              <div style={{
                fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "20px",
                color: mcqResult.correct ? "var(--green)" : "var(--red)",
              }}>
                {mcqResult.correct ? "Correct! Well done." : "Wrong Answer"}
              </div>
              {!mcqResult.correct && (
                <div style={{ color: "var(--text2)", fontSize: "14px", marginTop: "4px" }}>
                  Correct answer: <strong style={{ color: "var(--green)" }}>{correctAnswer}</strong>
                </div>
              )}
            </div>
            <div style={{
              marginLeft: "auto", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "36px",
              color: mcqResult.correct ? "var(--green)" : "var(--red)",
            }}>
              {mcqResult.correct ? "+5" : "+0"}<span style={{ fontSize: "14px", color: "var(--text3)" }}> pts</span>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={finishing}
            style={{ width: "100%", justifyContent: "center", padding: "15px" }}
          >
            {finishing ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Saving results…</> : current + 1 >= questions.length ? "View Final Results 🏁" : "Next Question →"}
          </button>
        </div>
      )}

      {/* ── THEORY MODE ── */}
      {!isMCQ && !feedback && (
        <>
          <textarea
            rows={7}
            placeholder="Type your answer here… Be specific, use examples from your experience, and explain your reasoning."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            style={{ marginBottom: "16px" }}
            disabled={evaluating}
          />
          {error && (
            <div style={{ padding: "12px 16px", background: "var(--red-dim)", border: "1px solid rgba(240,98,106,0.3)", borderRadius: "var(--radius-sm)", color: "var(--red)", marginBottom: "16px" }}>
              {error}
            </div>
          )}
          <button
            className="btn btn-primary"
            onClick={handleTheorySubmit}
            disabled={!answer.trim() || evaluating}
            style={{ width: "100%", justifyContent: "center", padding: "15px" }}
          >
            {evaluating ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Evaluating your answer…</> : "Submit Answer →"}
          </button>
        </>
      )}

      {/* Theory Feedback Panel */}
      {!isMCQ && feedback && vc && (
        <div style={{ animation: "fadeUp 0.4s ease" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "16px", padding: "20px 24px",
            background: vc.bg, border: `1px solid ${vc.color}40`, borderRadius: "var(--radius)", marginBottom: "20px",
          }}>
            <div style={{ fontSize: "36px" }}>{vc.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "22px", color: vc.color }}>{feedback.verdict}</div>
              <div style={{ color: "var(--text2)", fontSize: "14px" }}>Your score for this answer</div>
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "42px", color: vc.color, minWidth: "80px", textAlign: "right" }}>
              {feedback.score}<span style={{ fontSize: "18px", color: "var(--text3)" }}>/10</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div className="card" style={{ borderColor: "rgba(61,214,140,0.2)" }}>
              <div style={{ color: "var(--green)", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>✓ Strengths</div>
              <p style={{ color: "var(--text2)", fontSize: "14px", lineHeight: 1.6 }}>{feedback.strengths}</p>
            </div>
            <div className="card" style={{ borderColor: "rgba(240,98,106,0.2)" }}>
              <div style={{ color: "var(--red)", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>✗ Weaknesses</div>
              <p style={{ color: "var(--text2)", fontSize: "14px", lineHeight: 1.6 }}>{feedback.weaknesses}</p>
            </div>
          </div>

          <div className="card" style={{ marginBottom: "16px", borderColor: "rgba(124,106,247,0.2)" }}>
            <div style={{ color: "var(--accent2)", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>💡 Ideal Answer</div>
            <p style={{ color: "var(--text2)", fontSize: "14px", lineHeight: 1.6 }}>{feedback.ideal_answer}</p>
          </div>

          <div style={{
            display: "flex", alignItems: "flex-start", gap: "12px", padding: "16px 18px",
            background: "var(--yellow-dim)", border: "1px solid rgba(245,197,66,0.3)",
            borderRadius: "var(--radius-sm)", marginBottom: "24px",
          }}>
            <span style={{ fontSize: "18px" }}>🎯</span>
            <div>
              <div style={{ color: "var(--yellow)", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Pro Tip</div>
              <p style={{ color: "var(--text2)", fontSize: "14px", lineHeight: 1.5 }}>{feedback.tip}</p>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={finishing}
            style={{ width: "100%", justifyContent: "center", padding: "15px" }}
          >
            {finishing ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Saving results…</> : current + 1 >= questions.length ? "View Final Results 🏁" : "Next Question →"}
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}