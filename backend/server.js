// Chat-based interview route

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import SimpleInterviewSimulator from "./simpleInterview.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// In-memory storage for active interviews
const activeInterviews = new Map();

// Initialize Interview Simulator
const interviewSimulator = new SimpleInterviewSimulator(
  process.env.GOOGLE_API_KEY
);

// Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Interview Simulator API is running" });
});

app.post("/api/interview/:id/chat", async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }
  // Retrieve or create interview session
  let session = activeInterviews.get(id);
  if (!session) {
    // If not found, create a new session with default values (could be improved)
    session = {
      role: "Software Engineer",
      domain: "General",
      mode: "technical",
      questionNumber: 1,
      history: []
    };
    activeInterviews.set(id, session);
  }
  session.history = session.history || [];
  session.history.push({ role: "user", content: message });

  try {
    // If user says 'start', generate the first question
    if (message.trim().toLowerCase() === 'start' && !session.lastQuestion) {
      const question = await interviewSimulator.generateQuestion(session.role, session.domain, session.mode, session.questionNumber);
      session.lastQuestion = question;
      session.history.push({ role: "bot", content: question });
      return res.json({ reply: question });
    }
    // If last question exists, treat user message as answer, give feedback, and ask next question
    if (session.lastQuestion) {
      // Evaluate answer (optional: you can add LLM-based feedback here)
      // For now, just acknowledge and ask next question
      session.questionNumber += 1;
      if (session.questionNumber > 5) {
        session.isComplete = true;
        const endMsg = "Interview complete! Thank you for participating.";
        session.history.push({ role: "bot", content: endMsg });
        return res.json({ reply: endMsg });
      }
      const nextQuestion = await interviewSimulator.generateQuestion(session.role, session.domain, session.mode, session.questionNumber);
      session.lastQuestion = nextQuestion;
      session.history.push({ role: "bot", content: nextQuestion });
      return res.json({ reply: nextQuestion });
    }
    // Fallback
    return res.json({ reply: "Please type 'start' to begin the interview." });
  } catch (err) {
    console.error("Chatbot error:", err);
    return res.status(500).json({ error: "Failed to generate response" });
  }
});

// Start a new interview
app.post("/api/interview/start", async (req, res) => {
  try {
    const { role, domain, mode } = req.body;

    if (!role || !domain || !mode) {
      return res.status(400).json({
        error: "Missing required fields: role, domain, mode",
      });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Google API key not configured",
      });
    }

    const interviewId = uuidv4();

    // Generate first question
    const firstQuestion = await interviewSimulator.generateQuestion(
      role,
      domain,
      mode,
      1
    );

    // Store the interview state
    const interviewState = {
      id: interviewId,
      role,
      domain,
      mode,
      currentQuestion: firstQuestion,
      currentQuestionNumber: 1,
      totalQuestions: 5,
      questions: [firstQuestion],
      answers: [],
      evaluations: [],
      scores: [],
      feedbacks: [],
      totalScore: 0,
      isComplete: false,
      createdAt: new Date().toISOString(),
    };

    activeInterviews.set(interviewId, interviewState);

    res.json({
      interviewId,
      currentQuestion: firstQuestion,
      questionNumber: 1,
      totalQuestions: 5,
      mode,
      role,
      domain,
    });
  } catch (error) {
    console.error("Error starting interview:", error);
    res.status(500).json({
      error: "Failed to start interview",
      details: error.message,
    });
  }
});

// Submit an answer
app.post("/api/interview/:id/answer", async (req, res) => {
  // console.log("Answer received:", req.body,req.params.id);
  try {
    const { id } = req.params;
    const { answer } = req.body;

    if (!answer) {
      return res.status(400).json({
        error: "Answer is required",
      });
    }

    const interview = activeInterviews.get(id);
    if (!interview) {
      return res.status(404).json({
        error: "Interview not found",
      });
    }

    if (interview.isComplete) {
      return res.status(400).json({
        error: "Interview is already complete",
      });
    }

    // Evaluate the answer
    const evaluation = await interviewSimulator.evaluateAnswer(
      interview.currentQuestion,
      answer,
      interview.mode
    );

    // Add answer and evaluation to interview
    interview.answers.push(answer);
    interview.evaluations.push(evaluation);
    interview.scores.push(evaluation.score);
    interview.totalScore += evaluation.score;

    // Check if interview is complete
    const isComplete =
      interview.currentQuestionNumber >= interview.totalQuestions;

    let nextQuestion = null;
    if (!isComplete) {
      // Generate next question
      nextQuestion = await interviewSimulator.generateQuestion(
        interview.role,
        interview.domain,
        interview.mode,
        interview.currentQuestionNumber + 1
      );
      interview.questions.push(nextQuestion);
      interview.currentQuestion = nextQuestion;
      interview.currentQuestionNumber += 1;
    } else {
      // Generate summary
      const averageScore = interview.totalScore / interview.questions.length;
      const summary = await interviewSimulator.generateSummary(
        interview.questions,
        interview.answers,
        interview.evaluations,
        interview.role,
        interview.domain,
        interview.mode,
        averageScore
      );
      interview.summary = summary;
      interview.strengths = summary.strengths || [];
      interview.weaknesses = summary.weaknesses || [];
      interview.recommendations = summary.recommendations || [];
      interview.isComplete = true;
    }

    // Update stored interview
    activeInterviews.set(id, interview);

    // Prepare response
    const response = {
      questionNumber: interview.currentQuestionNumber,
      totalQuestions: interview.totalQuestions,
      isComplete: interview.isComplete,
      currentQuestion: interview.currentQuestion,
      lastAnswer: answer,
      lastEvaluation: evaluation,
      lastFeedback: evaluation,
      lastScore: evaluation.score,
    };

    // If interview is complete, include summary
    if (interview.isComplete) {
      response.summary = interview.summary;
      response.totalScore = interview.totalScore;
      response.averageScore = interview.totalScore / interview.questions.length;
      response.strengths = interview.strengths;
      response.weaknesses = interview.weaknesses;
      response.recommendations = interview.recommendations;
    }

    res.json(response);
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({
      error: "Failed to submit answer",
      details: error.message,
    });
  }
});

// Get interview status
app.get("/api/interview/:id/status", (req, res) => {
  try {
    const { id } = req.params;
    const interview = activeInterviews.get(id);

    if (!interview) {
      return res.status(404).json({
        error: "Interview not found",
      });
    }

    res.json({
      id: interview.id,
      role: interview.role,
      domain: interview.domain,
      mode: interview.mode,
      questionNumber: interview.currentQuestionNumber,
      totalQuestions: interview.totalQuestions,
      isComplete: interview.isComplete,
      currentQuestion: interview.currentQuestion,
      createdAt: interview.createdAt,
    });
  } catch (error) {
    console.error("Error getting interview status:", error);
    res.status(500).json({
      error: "Failed to get interview status",
      details: error.message,
    });
  }
});

// Get full interview results
app.get("/api/interview/:id/results", (req, res) => {
  try {
    const { id } = req.params;
    const interview = activeInterviews.get(id);

    if (!interview) {
      return res.status(404).json({
        error: "Interview not found",
      });
    }

    if (!interview.isComplete) {
      return res.status(400).json({
        error: "Interview is not complete yet",
      });
    }

    res.json({
      id: interview.id,
      role: interview.role,
      domain: interview.domain,
      mode: interview.mode,
      createdAt: interview.createdAt,
      completedAt: new Date().toISOString(),
      questions: interview.questions,
      answers: interview.answers,
      evaluations: interview.evaluations,
      scores: interview.scores,
      feedbacks: interview.feedbacks,
      summary: interview.summary,
      totalScore: interview.totalScore,
      averageScore: interview.totalScore / interview.questions.length,
      strengths: interview.strengths,
      weaknesses: interview.weaknesses,
      recommendations: interview.recommendations,
    });
  } catch (error) {
    console.error("Error getting interview results:", error);
    res.status(500).json({
      error: "Failed to get interview results",
      details: error.message,
    });
  }
});

// Export interview results as PDF
app.get("/api/interview/:id/export/pdf", async (req, res) => {
  try {
    const { id } = req.params;
    const interview = activeInterviews.get(id);

    if (!interview) {
      return res.status(404).json({
        error: "Interview not found",
      });
    }

    if (!interview.isComplete) {
      return res.status(400).json({
        error: "Interview is not complete yet",
      });
    }

    // Create PDF
    const doc = new PDFDocument();
    const filename = `interview-${id}-${
      new Date().toISOString().split("T")[0]// 
    }.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(20).text("Interview Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(16).text("Interview Details", { underline: true });
    doc.fontSize(12).text(`Role: ${interview.role}`);
    doc.text(`Domain: ${interview.domain}`);
    doc.text(`Type: ${interview.mode}`);
    doc.text(`Date: ${new Date(interview.createdAt).toLocaleDateString()}`);
    doc.text(
      `Average Score: ${(
        interview.totalScore / interview.questions.length
      ).toFixed(1)}/10`
    );
    doc.moveDown();

    // Questions and Answers
    doc.fontSize(16).text("Questions and Answers", { underline: true });
    doc.moveDown();

    for (let i = 0; i < interview.questions.length; i++) {
      doc.fontSize(14).text(`Question ${i + 1}:`, { underline: true });
      doc.fontSize(12).text(interview.questions[i]);
      doc.moveDown(0.5);

      if (interview.answers[i]) {
        doc.text(`Answer: ${interview.answers[i]}`);
        doc.moveDown(0.5);
      }

      if (interview.evaluations[i]) {
        const evaluation = interview.evaluations[i];
        doc.text(`Score: ${evaluation.score}/10`);
        doc.text(`Strengths: ${evaluation.strengths.join(", ")}`);
        doc.text(`Areas for Improvement: ${evaluation.weaknesses.join(", ")}`);
        doc.text(`Suggestions: ${evaluation.suggestions.join(", ")}`);
        doc.text(`Feedback: ${evaluation.overall_feedback}`);
      }

      doc.moveDown();
    }

    // Summary
    if (interview.summary) {
      doc.addPage();
      doc.fontSize(16).text("Interview Summary", { underline: true });
      doc.moveDown();

      doc.fontSize(14).text("Strengths:", { underline: true });
      interview.strengths.forEach((strength) => {
        doc.fontSize(12).text(`• ${strength}`);
      });
      doc.moveDown();

      doc.fontSize(14).text("Areas for Improvement:", { underline: true });
      interview.weaknesses.forEach((weakness) => {
        doc.fontSize(12).text(`• ${weakness}`);
      });
      doc.moveDown();

      doc.fontSize(14).text("Recommendations:", { underline: true });
      interview.recommendations.forEach((rec) => {
        doc.fontSize(12).text(`• ${rec}`);
      });
      doc.moveDown();

      doc
        .fontSize(12)
        .text(`Final Feedback: ${interview.summary.final_feedback}`);
    }

    doc.end();
  } catch (error) {
    console.error("Error exporting PDF:", error);
    res.status(500).json({
      error: "Failed to export PDF",
      details: error.message,
    });
  }
});

// Get available roles and domains
app.get("/api/roles", (req, res) => {
  const roles = [
    "Software Engineer",
    "Data Scientist",
    "Product Manager",
    "UX Designer",
    "DevOps Engineer",
    "Machine Learning Engineer",
    "Full Stack Developer",
    "Backend Developer",
    "Frontend Developer",
    "Mobile Developer",
    "Cloud Architect",
    "Cybersecurity Analyst",
    "Business Analyst",
    "Project Manager",
    "Technical Lead",
  ];

  res.json({ roles });
});

app.get("/api/domains", (req, res) => {
  const domains = [
    "Technology",
    "Finance",
    "Healthcare",
    "E-commerce",
    "Education",
    "Gaming",
    "Social Media",
    "IoT",
    "Blockchain",
    "AI/ML",
    "Cybersecurity",
    "Cloud Computing",
    "Mobile Development",
    "Web Development",
    "Data Analytics",
  ];

  res.json({ domains });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    details:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Interview Simulator API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Make sure to set GOOGLE_API_KEY in your .env file`);
});

export default app;
