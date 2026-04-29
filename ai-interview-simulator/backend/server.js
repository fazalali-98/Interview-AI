const express = require("express");
const cors = require("cors");
require("dotenv").config();

const interviewRoutes = require("./routes/interview");

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json({ limit: "10mb" }));

app.use("/api/interview", interviewRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "AI Interview Simulator API running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
});
