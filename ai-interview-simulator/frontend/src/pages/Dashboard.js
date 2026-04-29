import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllSessions, deleteSession } from "../api";

const getScoreColor = (score) => {
  if (score >= 8) return "var(--green)";
  if (score >= 5) return "var(--yellow)";
  return "var(--red)";
};

const roleIcons = {
  "Frontend Developer": "🖥️",
  "Backend Developer": "⚙️",
  "Java Developer": "☕",
  "Data Structures & Algorithms": "🧮",
  "Full Stack Developer": "🔗",
  "HR Round": "🤝",
  "Python Developer": "🐍",
  "DevOps Engineer": "🚀",
};

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSessions = async () => {
    try {
      const res = await getAllSessions();
      setSessions(res.data.sessions || []);
    } catch {
      setError("Could not load sessions. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this session?")) return;
    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Failed to delete");
    }
  };

  const avgScore = sessions.length
    ? (sessions.reduce((s, r) => s + parseFloat(r.score || 0), 0) / sessions.length).toFixed(1)
    : 0;

  const roleCount = sessions.reduce((acc, s) => {
    acc[s.role] = (acc[s.role] || 0) + 1;
    return acc;
  }, {});
  const topRole = Object.entries(roleCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ marginBottom: "36px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 800 }}>📊 Your Dashboard</h1>
        <p style={{ color: "var(--text2)", marginTop: "6px" }}>Track your interview progress over time</p>
      </div>

      {/* Stats */}
      {!loading && sessions.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "36px" }}>
          {[
            { label: "Total Sessions", value: sessions.length, icon: "🎯" },
            { label: "Avg Score", value: `${avgScore}/10`, icon: "📈" },
            { label: "Most Practiced", value: topRole.split(" ")[0], icon: roleIcons[topRole] || "💼" },
          ].map((stat) => (
            <div key={stat.label} className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>{stat.icon}</div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "26px", color: "var(--text)" }}>{stat.value}</div>
              <div style={{ color: "var(--text3)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "4px" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Session List */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: "80px", borderRadius: "var(--radius)" }} />
          ))}
        </div>
      )}

      {error && (
        <div style={{ padding: "16px 20px", background: "var(--red-dim)", border: "1px solid rgba(240,98,106,0.3)", borderRadius: "var(--radius-sm)", color: "var(--red)" }}>
          ⚠ {error}
        </div>
      )}

      {!loading && !error && sessions.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎯</div>
          <h2 style={{ marginBottom: "8px" }}>No sessions yet</h2>
          <p style={{ color: "var(--text2)", marginBottom: "24px" }}>Start your first interview to see it here.</p>
          <Link to="/" className="btn btn-primary">Start Interview</Link>
        </div>
      )}

      {!loading && sessions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h2 style={{ fontSize: "18px" }}>Recent Sessions</h2>
            <Link to="/" className="btn btn-primary" style={{ padding: "10px 20px", fontSize: "13px" }}>+ New Interview</Link>
          </div>
          {sessions.map((session) => (
            <div key={session.id} className="card" style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              padding: "20px 24px",
              transition: "border-color 0.2s",
            }}>
              <div style={{ fontSize: "28px" }}>{roleIcons[session.role] || "💼"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, marginBottom: "4px" }}>{session.role}</div>
                <div style={{ color: "var(--text3)", fontSize: "13px" }}>
                  {new Date(session.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  {session.resume_used ? " · Resume used" : ""}
                </div>
              </div>
              <div style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: "24px",
                color: getScoreColor(parseFloat(session.score)),
                minWidth: "70px",
                textAlign: "center",
              }}>
                {parseFloat(session.score).toFixed(1)}<span style={{ fontSize: "13px", color: "var(--text3)" }}>/10</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <Link to={`/session/${session.id}`} className="btn btn-ghost" style={{ padding: "8px 16px", fontSize: "13px" }}>
                  View
                </Link>
                <button
                  className="btn btn-ghost"
                  onClick={() => handleDelete(session.id)}
                  style={{ padding: "8px 12px", fontSize: "13px", color: "var(--red)", borderColor: "rgba(240,98,106,0.3)" }}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
