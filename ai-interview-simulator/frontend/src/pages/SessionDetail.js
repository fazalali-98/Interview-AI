import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSession } from "../api";

const getScoreColor = (s) => s >= 8 ? "var(--green)" : s >= 5 ? "var(--yellow)" : "var(--red)";

export default function SessionDetail() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession(sessionId)
      .then((res) => setData(res.data))
      .catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false));
  }, [sessionId, navigate]);

  if (loading) return (
    <div style={{ maxWidth: "780px", margin: "0 auto", padding: "48px 24px" }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "120px", borderRadius: "var(--radius)", marginBottom: "16px" }} />)}
    </div>
  );

  if (!data) return null;

  const { session, questions } = data;

  return (
    <div style={{ maxWidth: "780px", margin: "0 auto", padding: "40px 24px" }}>
      <button className="btn btn-ghost" onClick={() => navigate("/dashboard")} style={{ marginBottom: "28px", padding: "8px 16px" }}>
        ← Back to Dashboard
      </button>

      <div className="card" style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "24px" }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "24px", marginBottom: "6px" }}>{session.role}</h1>
          <p style={{ color: "var(--text2)", fontSize: "14px" }}>
            {new Date(session.created_at).toLocaleDateString("en-IN", { dateStyle: "full" })}
            {session.resume_used ? " · Resume-tailored" : ""}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "48px", color: getScoreColor(session.score) }}>
            {parseFloat(session.score).toFixed(1)}
          </div>
          <div style={{ color: "var(--text3)", fontSize: "13px" }}>Average Score /10</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {questions.map((q, i) => {
          const fb = q.ai_feedback;
          return (
            <div key={q.id} className="card" style={{ borderLeft: `3px solid ${getScoreColor(q.score)}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ color: "var(--text3)", fontSize: "12px", fontFamily: "Syne, sans-serif", fontWeight: 700, textTransform: "uppercase" }}>Q{i + 1}</span>
                <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "20px", color: getScoreColor(q.score) }}>
                  {q.score}/10
                </span>
              </div>
              <p style={{ fontWeight: 500, marginBottom: "12px" }}>{q.question}</p>
              <div style={{ padding: "12px", background: "var(--surface2)", borderRadius: "var(--radius-sm)", marginBottom: "12px" }}>
                <div style={{ color: "var(--text3)", fontSize: "11px", fontFamily: "Syne, sans-serif", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>Your Answer</div>
                <p style={{ color: "var(--text2)", fontSize: "14px" }}>{q.user_answer || "Not answered"}</p>
              </div>
              {fb && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px" }}>
                  <div style={{ color: "var(--text2)" }}><span style={{ color: "var(--green)", fontWeight: 700 }}>✓ </span>{fb.strengths}</div>
                  <div style={{ color: "var(--text2)" }}><span style={{ color: "var(--red)", fontWeight: 700 }}>✗ </span>{fb.weaknesses}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
