# 🎯 InterviewAI
### *Stop guessing. Start acing.*

> An AI-powered interview simulator that grills you with real questions, scores your answers, and tells you exactly where you're weak — before the actual interview does.

![Made with React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=flat-square&logo=node.js)
![Groq AI](https://img.shields.io/badge/AI-Groq%20API-F55036?style=flat-square)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=flat-square&logo=mysql)

---

## 🚀 What It Does

You pick a role. The AI interviews you. It scores every answer. You either improve — or you fail the real interview. Your choice.

- 🤖 **AI-generated questions** tailored to your role
- 📝 **MCQ or Theory mode** — your pick
- ⚡ **Instant feedback** — strengths, weaknesses, tips
- 📊 **Score tracking** — full history on your dashboard
- 🧠 **Resume-aware** — paste your resume for personalized questions

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Custom CSS |
| Backend | Node.js + Express |
| AI Brain | Groq API (LLaMA 3) |
| Database | MySQL via XAMPP |

---

## ⚙️ Setup — Get Running in 5 Minutes

### 1️⃣ Database
1. Open **XAMPP** → start **Apache** + **MySQL**
2. Visit `http://localhost/phpmyadmin`
3. Click **Import** → select `database/schema.sql` → **Go**

Done. Tables created. ✅

---

### 2️⃣ Backend
```bash
cd backend
npm install
```

Edit `.env`:
```env
GROQ_API_KEY=your_key_here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=        # leave blank for XAMPP default
DB_NAME=ai_interview_simulator
```

```bash
npm run dev
```

Test it → `http://localhost:5000/api/health` should return `{"status":"ok"}` ✅

---

### 3️⃣ Frontend
```bash
cd frontend
npm install
npm start
```

Opens at `http://localhost:3000` 🎉

---

## 🎮 How To Use

```
1. Pick your role (Frontend, Backend, DSA, HR, etc.)
2. Paste your resume (optional — for personalized Qs)
3. Choose: MCQ mode or Theory mode
4. Answer 5 AI-generated questions
5. See your score + detailed feedback
6. Check Dashboard for all past attempts
```

---

## 📁 Project Structure

```
ai-interview-simulator/
├── 📂 database/
│   └── schema.sql              ← Run this first
├── 📂 backend/
│   ├── .env                    ← Your API key goes here
│   ├── server.js
│   ├── config/db.js
│   ├── routes/interview.js
│   └── controllers/
│       └── interviewController.js
└── 📂 frontend/
    └── src/
        ├── App.js
        ├── api.js
        ├── index.css
        ├── components/
        │   └── Navbar.js
        └── pages/
            ├── Home.js
            ├── Interview.js
            ├── Results.js
            ├── Dashboard.js
            └── SessionDetail.js
```

---

## 🔑 Get Your Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up / Log in
3. **API Keys** → Create Key
4. Paste into `backend/.env`

---

## 🎭 Supported Roles

| Role | What Gets Tested |
|------|-----------------|
| 🖥️ Frontend Developer | React, CSS, JS, Browser APIs |
| ⚙️ Backend Developer | Node.js, APIs, Databases |
| ☕ Java Developer | OOP, Spring, Core Java |
| 🧮 DSA | Arrays, Trees, Complexity |
| 🌐 Full Stack | End-to-end thinking |
| 🐍 Python Developer | Python, scripting, libraries |
| 🚀 DevOps Engineer | CI/CD, Docker, cloud |
| 🤝 HR Round | Behavioural & soft skills |

---

## 💡 Why I Built This

Most interview prep tools just show you questions. This one *interviews* you — evaluates your actual answers, not just whether you read a flashcard. Built to simulate the pressure of a real interview and give feedback that's actually useful.

---

<div align="center">

**Built by Fazal Ali** · [GitHub](https://github.com/fazalali-98/Interview-AI)

*If this helped you land a job, you owe me a coffee ☕*

</div>
