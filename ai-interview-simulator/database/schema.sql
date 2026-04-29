-- AI Interview Simulator Database Schema
-- Run this in phpMyAdmin or MySQL terminal

CREATE DATABASE IF NOT EXISTS ai_interview_simulator;
USE ai_interview_simulator;

CREATE TABLE IF NOT EXISTS interview_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role VARCHAR(100) NOT NULL,
  resume_used TINYINT(1) DEFAULT 0,
  total_questions INT DEFAULT 5,
  score DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS interview_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  question_number INT NOT NULL,
  question TEXT NOT NULL,
  user_answer TEXT,
  ai_feedback TEXT,
  score INT DEFAULT 0,
  FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE
);

-- View for dashboard stats
CREATE OR REPLACE VIEW session_summary AS
SELECT 
  s.id,
  s.role,
  s.score,
  s.total_questions,
  s.resume_used,
  s.created_at,
  COUNT(q.id) as answered_questions
FROM interview_sessions s
LEFT JOIN interview_questions q ON s.id = q.session_id
GROUP BY s.id
ORDER BY s.created_at DESC;
