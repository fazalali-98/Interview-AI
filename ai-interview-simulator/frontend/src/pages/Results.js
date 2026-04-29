import React from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";

const getScoreLabel = (score, max) => {
  const pct = score / max;
  if (pct >= 0.8) return { label: "Outstanding", color: "var(--green)", icon: "🏆" };
  if (pct >= 0.6) return { label: "Good", color: "var(--green)", icon: "✅" };
  if (pct >= 0.4) return { label: "Average", color: "var(--yellow)", icon: "📊" };
  return { label: "Needs Work", color: "var(--red)", icon: "📝" };
};

export default function Results() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { allFeedback = [], role = "", mode = "theory" } = location.state || {};

  const isMCQ = mode === "mcq";

  // MCQ: 5 marks per question, max 25. Theory: avg out of 10
  const totalScore = isMCQ
    ? allFeedback.filter((f) => f.correct).length * 5
    : parseFloat(
        allFeedback.length
          ? (allFeedback.reduce((s, f) => s + (f.feedback?.score || 0), 0) / allFeedback.length).toFixed(1)
          : 0
      );

  const maxScore = isMCQ ? 25 : 10;
  const scoreInfo = getScoreLabel(totalScore, maxScore);
  const correctCount = isMCQ ? allFeedback.filter((f) => f.correct).length : null;

  return (
    <div style={{ maxWidth: "820px", margin: "0 auto", padding: "40px 24px" }}>
      {/* Score Hero */}
      <div style={{
        textAlign: "center", padding: "48px 32px",
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", marginBottom: "40px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-40px", right: "-40px",
          width: "200px", height: "200px", background: "var(--accent-glow)",
          borderRadius: "50%", filter: "blur(60px)",
        }} />

        {/* Mode badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          padding: "5px 14px", borderRadius: "20px", marginBottom: "20px",
          background: isMCQ ? "rgba(61,214,140,0.12)" : "rgba(245,197,66,0.12)",
          color: isMCQ ? "var(--green)" : "var(--yellow)",
          border: isMCQ ? "1px solid rgba(61,214,140,0.3)" : "1px solid rgba(245,197,66,0.3)",
          fontSize: "12px", fontFamily: "Syne, sans-serif", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          {isMCQ ? "🔘 MCQ Mode" : "✍️ Theory Mode"}
        </div>

        <div style={{ fontSize: "56px", marginBottom: "12px" }}>{scoreInfo.icon}</div>
        <div style={{
          fontFamily: "Syne, sans-serif", fontWeight: 800,
          fontSize: "72px", color: scoreInfo.color,
          lineHeight: 1, marginBottom: "8px",
        }}>
          {totalScore}<span style={{ fontSize: "28px", color: "var(--text3)" }}>/{maxScore}</span>
        </div>
        <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "22px", color: scoreInfo.color, marginBottom: "12px" }}>
          {scoreInfo.label}
        </div>
        <div style={{ color: "var(--text2)" }}>
          Completed {allFeedback.length} questions for <strong style={{ color: "var(--text)" }}>{role}</strong>
        </div>

        {/* Mini stats */}
        <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginTop: "28px", flexWrap: "wrap" }}>
          {isMCQ ? [
            { label: "Correct", value: `${correctCount} / ${allFeedback.length}` },
            { label: "Wrong", value: `${allFeedback.length - correctCount} / ${allFeedback.length}` },
            { label: "Score", value: `${totalScore} / ${maxScore}` },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "24px", color: "var(--text)" }}>{stat.value}</div>
              <div style={{ color: "var(--text3)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</div>
            </div>
          )) : [
            { label: "Best Score", value: `${Math.max(...allFeedback.map(f => f.feedback?.score || 0))}/10` },
            { label: "Lowest Score", value: `${Math.min(...allFeedback.map(f => f.feedback?.score || 0))}/10` },
            { label: "Questions", value: allFeedback.length },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "24px", color: "var(--text)" }}>{stat.value}</div>
              <div style={{ color: "var(--text3)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Q&A Breakdown */}
      <h2 style={{ fontSize: "20px", marginBottom: "24px" }}>📋 Question Breakdown</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "40px" }}>
        {allFeedback.map((item, i) => {
          const fb = item.feedback;
          const isCorrect = item.correct; // only set in MCQ mode

          // For color coding
          const borderColor = isMCQ
            ? (isCorrect ? "var(--green)" : "var(--red)")
            : (() => { const si = getScoreLabel(fb?.score || 0, 10); return si.color; })();

          return (
            <div key={i} className="card" style={{ borderLeft: `3px solid ${borderColor}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <div style={{ flex: 1 }}>
                  <span style={{ color: "var(--text3)", fontSize: "12px", fontFamily: "Syne, sans-serif", fontWeight: 700, textTransform: "uppercase" }}>Q{i + 1}</span>
                  <p style={{ fontWeight: 500, marginTop: "4px", lineHeight: 1.5 }}>{item.question}</p>
                </div>
                {/* MCQ: show correct/wrong badge. Theory: show score */}
                {isMCQ ? (
                  <div style={{
                    marginLeft: "16px", padding: "6px 14px", borderRadius: "var(--radius-sm)",
                    background: isCorrect ? "var(--green-dim)" : "var(--red-dim)",
                    color: isCorrect ? "var(--green)" : "var(--red)",
                    fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "14px",
                    whiteSpace: "nowrap",
                  }}>
                    {isCorrect ? "✓ +5 pts" : "✗ +0 pts"}
                  </div>
                ) : (
                  <div style={{
                    fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "28px",
                    color: getScoreLabel(fb?.score || 0, 10).color,
                    marginLeft: "16px", minWidth: "64px", textAlign: "right",
                  }}>
                    {fb?.score}<span style={{ fontSize: "14px", color: "var(--text3)" }}>/10</span>
                  </div>
                )}
              </div>

              {/* Your answer */}
              <div style={{ padding: "12px 16px", background: "var(--surface2)", borderRadius: "var(--radius-sm)", marginBottom: "14px" }}>
                <div style={{ color: "var(--text3)", fontSize: "11px", fontFamily: "Syne, sans-serif", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>Your Answer</div>
                <p style={{ color: "var(--text2)", fontSize: "14px", lineHeight: 1.5 }}>{item.answer}</p>
              </div>

              {/* MCQ: show correct answer if wrong */}
              {isMCQ && !isCorrect && (
                <div style={{ padding: "12px 16px", background: "var(--green-dim)", borderRadius: "var(--radius-sm)", marginBottom: "14px", border: "1px solid rgba(61,214,140,0.2)" }}>
                  <div style={{ color: "var(--green)", fontSize: "11px", fontFamily: "Syne, sans-serif", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>✓ Correct Answer</div>
                  <p style={{ color: "var(--text2)", fontSize: "14px", lineHeight: 1.5 }}>{fb?.ideal_answer}</p>
                </div>
              )}

              {/* Theory: strengths, weaknesses, tip */}
              {!isMCQ && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                    <div>
                      <span style={{ color: "var(--green)", fontWeight: 600 }}>✓ </span>
                      <span style={{ color: "var(--text2)" }}>{fb?.strengths}</span>
                    </div>
                    <div>
                      <span style={{ color: "var(--red)", fontWeight: 600 }}>✗ </span>
                      <span style={{ color: "var(--text2)" }}>{fb?.weaknesses}</span>
                    </div>
                  </div>
                  {fb?.tip && (
                    <div style={{ marginTop: "12px", padding: "10px 14px", background: "var(--yellow-dim)", borderRadius: "var(--radius-sm)", fontSize: "13px", color: "var(--yellow)" }}>
                      🎯 <strong>Tip:</strong> {fb.tip}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
        <button className="btn btn-primary" onClick={() => navigate("/")} style={{ padding: "14px 32px" }}>
          🔄 Try Another Role
        </button>
        <Link to="/dashboard" className="btn btn-ghost" style={{ padding: "14px 32px" }}>
          📊 View Dashboard
        </Link>
      </div>
    </div>
  );
}