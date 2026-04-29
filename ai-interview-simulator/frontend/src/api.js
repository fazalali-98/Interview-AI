import axios from "axios";

const API = axios.create({ baseURL: "/api/interview" });

export const generateQuestions = (role, resume) =>
  API.post("/generate-questions", { role, resume });

export const evaluateAnswer = (sessionId, questionNumber, question, answer, role) =>
  API.post("/evaluate-answer", { sessionId, questionNumber, question, answer, role });

export const finalizeSession = (sessionId) =>
  API.post("/finalize-session", { sessionId });

export const getSession = (sessionId) =>
  API.get(`/sessions/${sessionId}`);

export const getAllSessions = () =>
  API.get("/sessions");

export const deleteSession = (sessionId) =>
  API.delete(`/sessions/${sessionId}`);
