import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { generateQuestions } from "../api";

const ROLES = [
  { id: "Frontend Developer", icon: "🖥️", desc: "React, CSS, JS, Browser APIs" },
  { id: "Backend Developer", icon: "⚙️", desc: "Node.js, APIs, Databases, System Design" },
  { id: "Java Developer", icon: "☕", desc: "OOP, Spring, Collections, Multithreading" },
  { id: "Data Structures & Algorithms", icon: "🧮", desc: "Arrays, Trees, Graphs, DP, Sorting" },
  { id: "Full Stack Developer", icon: "🔗", desc: "End-to-end development, both layers" },
  { id: "HR Round", icon: "🤝", desc: "Behavioural, Situational, Culture Fit" },
  { id: "Python Developer", icon: "🐍", desc: "Python, OOP, Libraries, Scripting" },
  { id: "DevOps Engineer", icon: "🚀", desc: "CI/CD, Docker, Kubernetes, Cloud" },
];

const MODES = [
  {
    id: "mcq",
    icon: "🔘",
    title: "MCQ Based",
    desc: "Choose from 4 options per question. Instant correct / wrong result shown after each answer.",
  },
  {
    id: "theory",
    icon: "✍️",
    title: "Theory Based",
    desc: "Type your answer in detail. Get AI feedback with strengths, weaknesses & improvement tips.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [resume, setResume] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const extractTextFromFile = (file) => {
    return new Promise((resolve, reject) => {
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject("Failed to read file");
        reader.readAsText(file);
      } else if (file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target.result;
          const extracted = text
            .replace(/[^\x20-\x7E\n\r\t]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          resolve(extracted.length > 100 ? extracted : "PDF uploaded: " + file.name);
        };
        reader.onerror = () => reject("Failed to read PDF");
        reader.readAsBinaryString(file);
      } else {
        reject("Unsupported file type. Please upload PDF or TXT.");
      }
    });
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("File too large. Max 5MB."); return; }
    try {
      const text = await extractTextFromFile(file);
      setResume(text);
      setFileName(file.name);
      setError("");
    } catch (err) {
      setError(typeof err === "string" ? err : "Could not read file.");
    }
  };

  const handleFileInput = (e) => { const file = e.target.files[0]; if (file) handleFile(file); };
  const handleDrop = (e) => { e.preventDefault(); setDragging(false); const file = e.dataTransfer.files[0]; if (file) handleFile(file); };
  const handleRemoveFile = () => { setResume(""); setFileName(""); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const handleStart = async () => {
    if (!selectedRole || !selectedMode) return;
    setLoading(true);
    setError("");
    try {
      const res = await generateQuestions(selectedRole, resume);
      const { sessionId, questions } = res.data;
      navigate("/interview", {
        state: { sessionId, questions, role: selectedRole, mode: selectedMode },
      });
    } catch (err) {
      setError("Failed to generate questions. Check your API key and backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "56px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "6px 16px", background: "var(--accent-glow)",
          border: "1px solid rgba(124,106,247,0.3)", borderRadius: "20px", marginBottom: "24px",
        }}>
          <span style={{ fontSize: "12px", color: "var(--accent2)", fontFamily: "Syne, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            ✨ AI-Powered Interview Practice
          </span>
        </div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 800, marginBottom: "16px", lineHeight: 1.1, color: "#ffffff" }}>
          Ace Your Next<br />
          <span style={{ color: "var(--accent2)" }}>Tech Interview</span>
        </h1>
        <p style={{ color: "var(--accent2)", fontSize: "17px", maxWidth: "520px", margin: "0 auto" }}>
          Practice with AI-generated questions tailored to your role and resume. Get instant feedback, scores, and improvement tips.
        </p>
      </div>

      {/* Step 01 — Role */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "18px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "var(--accent)" }}>01</span>
          <span style={{ color: "#ffffff" }}>Select Your Role</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
          {ROLES.map((role) => (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              style={{
                padding: "18px", borderRadius: "var(--radius)",
                border: `1px solid ${selectedRole === role.id ? "var(--accent)" : "var(--border)"}`,
                background: selectedRole === role.id ? "rgba(124,106,247,0.08)" : "var(--surface)",
                cursor: "pointer", transition: "all 0.2s",
                boxShadow: selectedRole === role.id ? "var(--shadow-accent)" : "none",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>{role.icon}</div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "14px", marginBottom: "6px", color: "#ffffff" }}>{role.id}</div>
              <div style={{ color: "#888888", fontSize: "12px", lineHeight: 1.4 }}>{role.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 02 — Mode */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "18px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "var(--accent)" }}>02</span>
          <span style={{ color: "#ffffff" }}>Choose Interview Mode</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {MODES.map((mode) => {
            const isSelected = selectedMode === mode.id;
            return (
              <div
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                style={{
                  padding: "24px", borderRadius: "var(--radius)",
                  border: `2px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                  background: isSelected ? "rgba(124,106,247,0.08)" : "var(--surface)",
                  cursor: "pointer", transition: "all 0.2s",
                  boxShadow: isSelected ? "var(--shadow-accent)" : "none",
                  position: "relative",
                }}
              >
                {isSelected && (
                  <div style={{
                    position: "absolute", top: "12px", right: "12px",
                    width: "20px", height: "20px", borderRadius: "50%",
                    background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", color: "#fff", fontWeight: 700,
                  }}>✓</div>
                )}
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>{mode.icon}</div>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "16px", color: "#ffffff", marginBottom: "8px" }}>
                  {mode.title}
                </div>
                <div style={{ color: "#888888", fontSize: "13px", lineHeight: 1.5 }}>{mode.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 03 — Resume */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "18px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "var(--accent)" }}>03</span>
          <span style={{ color: "#ffffff" }}>Upload Your Resume</span>
          <span style={{ color: "var(--text3)", fontSize: "13px", fontFamily: "DM Sans, sans-serif", fontWeight: 400 }}>
            (optional — personalizes your questions)
          </span>
        </h2>

        {!fileName ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            style={{
              marginTop: "12px",
              border: `2px dashed ${dragging ? "var(--accent)" : "var(--border2)"}`,
              borderRadius: "var(--radius)", padding: "48px 24px", textAlign: "center",
              cursor: "pointer", background: dragging ? "rgba(124,106,247,0.05)" : "var(--surface)",
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📄</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "15px", marginBottom: "8px", color: "#ffffff" }}>
              Drop your resume here or click to browse
            </div>
            <div style={{ color: "#888888", fontSize: "13px" }}>Supports PDF and TXT files · Max 5MB</div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "16px",
              padding: "8px 20px", background: "var(--surface2)", border: "1px solid var(--border2)",
              borderRadius: "var(--radius-sm)", color: "var(--text2)", fontSize: "13px",
              fontFamily: "Syne, sans-serif", fontWeight: 600,
            }}>📁 Choose File</div>
            <input ref={fileInputRef} type="file" accept=".pdf,.txt" onChange={handleFileInput} style={{ display: "none" }} />
          </div>
        ) : (
          <div style={{
            marginTop: "12px", display: "flex", alignItems: "center", gap: "16px",
            padding: "18px 20px", background: "var(--green-dim)",
            border: "1px solid rgba(61,214,140,0.3)", borderRadius: "var(--radius)",
          }}>
            <div style={{ fontSize: "32px" }}>✅</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--green)", fontSize: "14px" }}>
                Resume uploaded successfully
              </div>
              <div style={{ color: "var(--text2)", fontSize: "13px", marginTop: "3px" }}>
                {fileName} · Questions will be personalized to your background
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              style={{
                background: "transparent", border: "1px solid rgba(240,98,106,0.4)",
                borderRadius: "var(--radius-sm)", color: "var(--red)", padding: "6px 14px",
                cursor: "pointer", fontSize: "13px", fontFamily: "Syne, sans-serif", fontWeight: 600,
              }}
            >Remove</button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: "14px 18px", background: "var(--red-dim)", border: "1px solid rgba(240,98,106,0.3)", borderRadius: "var(--radius-sm)", color: "var(--red)", marginBottom: "24px" }}>
          ⚠ {error}
        </div>
      )}

      {/* Start Button */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          className="btn btn-primary"
          onClick={handleStart}
          disabled={!selectedRole || !selectedMode || loading}
          style={{ fontSize: "16px", padding: "16px 48px" }}
        >
          {loading ? (
            <><span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span> Generating Questions…</>
          ) : (
            <>🎯 Start Interview — {selectedRole || "Select a role"}</>
          )}
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}