import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { generateQuestions } from "../api";

const ROLES = [
  { id: "Frontend Developer", tag: "FE", desc: "React, CSS, JS, Browser APIs" },
  { id: "Backend Developer", tag: "BE", desc: "Node.js, APIs, Databases, System Design" },
  { id: "Java Developer", tag: "JV", desc: "OOP, Spring, Collections, Multithreading" },
  { id: "Data Structures & Algorithms", tag: "DS", desc: "Arrays, Trees, Graphs, DP, Sorting" },
  { id: "Full Stack Developer", tag: "FS", desc: "End-to-end development, both layers" },
  { id: "HR Round", tag: "HR", desc: "Behavioural, Situational, Culture Fit" },
  { id: "Python Developer", tag: "PY", desc: "Python, OOP, Libraries, Scripting" },
  { id: "DevOps Engineer", tag: "DO", desc: "CI/CD, Docker, Kubernetes, Cloud" },
];

const MODES = [
  {
    id: "mcq",
    tag: "MCQ",
    title: "Multiple Choice",
    desc: "Choose from 4 options per question. Instant result shown after each answer.",
  },
  {
    id: "theory",
    tag: "TXT",
    title: "Theory Based",
    desc: "Type your answer in detail. Get AI feedback with strengths, gaps, and improvement tips.",
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
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "56px 24px" }}>

      {/* Hero */}
      <div style={{ marginBottom: "64px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "4px 12px",
          background: "rgba(0,255,133,0.06)",
          border: "1px solid rgba(0,255,133,0.2)",
          borderRadius: "3px", marginBottom: "28px",
        }}>
          <span style={{
            fontSize: "11px", color: "var(--accent)",
            fontFamily: "Space Mono, monospace", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.1em"
          }}>
            AI-Powered Interview Practice
          </span>
        </div>
        <h1 style={{
          fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700,
          marginBottom: "16px", lineHeight: 1.1, color: "#ffffff",
          fontFamily: "Space Mono, monospace",
        }}>
          Ace Your Next<br />
          <span style={{ color: "var(--accent)" }}>Tech Interview_</span>
        </h1>
        <p style={{ color: "var(--text2)", fontSize: "15px", maxWidth: "480px", lineHeight: 1.7 }}>
          Practice with AI-generated questions tailored to your role and resume.
          Get instant feedback, scores, and improvement tips.
        </p>
      </div>

      {/* Step 01 — Role */}
      <div style={{ marginBottom: "48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <span style={{
            fontFamily: "Space Mono, monospace", fontSize: "11px",
            color: "var(--accent)", fontWeight: 700, letterSpacing: "0.1em"
          }}>01</span>
          <span style={{ color: "#fff", fontSize: "13px", fontFamily: "Space Mono, monospace", fontWeight: 700, letterSpacing: "0.04em" }}>SELECT ROLE</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border2)" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "8px" }}>
          {ROLES.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                style={{
                  padding: "16px 18px",
                  borderRadius: "var(--radius)",
                  border: `1px solid ${isSelected ? "var(--accent)" : "var(--border2)"}`,
                  background: isSelected ? "rgba(0,255,133,0.05)" : "#111111",
                  cursor: "pointer", transition: "all 0.15s",
                  boxShadow: isSelected ? "var(--shadow-accent)" : "none",
                }}
              >
                <div style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  background: isSelected ? "var(--accent)" : "var(--surface3)",
                  borderRadius: "3px",
                  fontFamily: "Space Mono, monospace",
                  fontSize: "10px", fontWeight: 700,
                  color: isSelected ? "#000" : "var(--text2)",
                  marginBottom: "10px",
                  letterSpacing: "0.06em",
                }}>{role.tag}</div>
                <div style={{
                  fontFamily: "Space Mono, monospace", fontWeight: 700,
                  fontSize: "12px", marginBottom: "6px",
                  color: isSelected ? "#fff" : "#cccccc",
                  letterSpacing: "0.02em",
                }}>{role.id}</div>
                <div style={{ color: "var(--text2)", fontSize: "11px", lineHeight: 1.5 }}>{role.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 02 — Mode */}
      <div style={{ marginBottom: "48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <span style={{
            fontFamily: "Space Mono, monospace", fontSize: "11px",
            color: "var(--accent)", fontWeight: 700, letterSpacing: "0.1em"
          }}>02</span>
          <span style={{ color: "#fff", fontSize: "13px", fontFamily: "Space Mono, monospace", fontWeight: 700, letterSpacing: "0.04em" }}>SELECT MODE</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border2)" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {MODES.map((mode) => {
            const isSelected = selectedMode === mode.id;
            return (
              <div
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                style={{
                  padding: "22px 20px",
                  borderRadius: "var(--radius)",
                  border: `1px solid ${isSelected ? "var(--accent)" : "var(--border2)"}`,
                  background: isSelected ? "rgba(0,255,133,0.05)" : "#111111",
                  cursor: "pointer", transition: "all 0.15s",
                  boxShadow: isSelected ? "var(--shadow-accent)" : "none",
                  position: "relative",
                }}
              >
                {isSelected && (
                  <div style={{
                    position: "absolute", top: "14px", right: "14px",
                    width: "18px", height: "18px", borderRadius: "2px",
                    background: "var(--accent)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: "10px", color: "#000", fontWeight: 700,
                    fontFamily: "Space Mono, monospace",
                  }}>✓</div>
                )}
                <div style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  background: isSelected ? "var(--accent)" : "var(--surface3)",
                  borderRadius: "3px",
                  fontFamily: "Space Mono, monospace",
                  fontSize: "10px", fontWeight: 700,
                  color: isSelected ? "#000" : "var(--text2)",
                  marginBottom: "12px",
                  letterSpacing: "0.06em",
                }}>{mode.tag}</div>
                <div style={{
                  fontFamily: "Space Mono, monospace", fontWeight: 700,
                  fontSize: "14px", color: "#ffffff", marginBottom: "8px",
                }}>{mode.title}</div>
                <div style={{ color: "var(--text2)", fontSize: "12px", lineHeight: 1.6 }}>{mode.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 03 — Resume */}
      <div style={{ marginBottom: "48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <span style={{
            fontFamily: "Space Mono, monospace", fontSize: "11px",
            color: "var(--accent)", fontWeight: 700, letterSpacing: "0.1em"
          }}>03</span>
          <span style={{ color: "#fff", fontSize: "13px", fontFamily: "Space Mono, monospace", fontWeight: 700, letterSpacing: "0.04em" }}>UPLOAD RESUME</span>
          <span style={{ color: "var(--text3)", fontSize: "11px", fontFamily: "Space Mono, monospace" }}>// optional</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border2)" }} />
        </div>

        {!fileName ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            style={{
              border: `1px dashed ${dragging ? "var(--accent)" : "var(--border2)"}`,
              borderRadius: "var(--radius)", padding: "44px 24px", textAlign: "center",
              cursor: "pointer", background: dragging ? "rgba(0,255,133,0.03)" : "#0d0d0d",
              transition: "all 0.15s",
            }}
          >
            <div style={{
              fontFamily: "Space Mono, monospace", fontWeight: 700,
              fontSize: "13px", marginBottom: "8px", color: "#cccccc",
              letterSpacing: "0.02em",
            }}>
              Drop resume here or click to browse
            </div>
            <div style={{ color: "var(--text3)", fontSize: "11px", fontFamily: "Space Mono, monospace" }}>
              PDF or TXT &nbsp;&bull;&nbsp; max 5MB
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "18px",
              padding: "8px 18px", background: "#1a1a1a", border: "1px solid var(--border2)",
              borderRadius: "var(--radius)", color: "var(--text2)", fontSize: "12px",
              fontFamily: "Space Mono, monospace", fontWeight: 700,
            }}>Choose File</div>
            <input ref={fileInputRef} type="file" accept=".pdf,.txt" onChange={handleFileInput} style={{ display: "none" }} />
          </div>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", gap: "16px",
            padding: "16px 20px", background: "rgba(0,255,133,0.05)",
            border: "1px solid rgba(0,255,133,0.2)", borderRadius: "var(--radius)",
          }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "3px",
              background: "var(--accent)", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "11px", color: "#000", fontWeight: 700,
              fontFamily: "Space Mono, monospace", flexShrink: 0,
            }}>OK</div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "Space Mono, monospace", fontWeight: 700,
                color: "var(--accent)", fontSize: "12px",
              }}>
                Resume loaded
              </div>
              <div style={{ color: "var(--text2)", fontSize: "11px", marginTop: "3px", fontFamily: "Space Mono, monospace" }}>
                {fileName} &nbsp;&mdash;&nbsp; questions will be personalized
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              style={{
                background: "transparent", border: "1px solid rgba(255,77,77,0.3)",
                borderRadius: "var(--radius)", color: "var(--red)", padding: "6px 14px",
                cursor: "pointer", fontSize: "11px",
                fontFamily: "Space Mono, monospace", fontWeight: 700,
              }}
            >Remove</button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: "12px 16px", background: "var(--red-dim)",
          border: "1px solid rgba(255,77,77,0.25)", borderRadius: "var(--radius)",
          color: "var(--red)", marginBottom: "24px",
          fontFamily: "Space Mono, monospace", fontSize: "12px",
        }}>
          ERR: {error}
        </div>
      )}

      {/* Start Button */}
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        <button
          className="btn btn-primary"
          onClick={handleStart}
          disabled={!selectedRole || !selectedMode || loading}
          style={{ fontSize: "13px", padding: "14px 36px", letterSpacing: "0.04em" }}
        >
          {loading ? (
            <><span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>+</span>&nbsp;Generating questions...</>
          ) : (
            <>Run Interview {selectedRole ? `// ${selectedRole}` : "// select role first"}</>
          )}
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}