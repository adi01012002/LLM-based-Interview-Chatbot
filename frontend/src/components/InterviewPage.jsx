
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Download, CheckCircle } from "lucide-react";
import axios from "axios";
import ChatBot from "./ChatBot";
import styles from "./InterviewPage.module.css";


const InterviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const interviewData = useRef(null);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await axios.get(`/api/interview/${id}/status`);
        interviewData.current = response.data;
        setQuestionCount(response.data.questionCount ?? 1);
        const initialMessage = {
          role: "bot",
          content: `Hello! Welcome to your ${response.data.mode} interview for the ${response.data.role} role. Let's start with your first question.\n\n${response.data.currentQuestion}`,
        };
        setMessages([initialMessage]);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch interview status");
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [id]);

  const handleSendMessage = async (userInput, { requestMore = false } = {}) => {
    const newUserMessage = { role: "user", content: userInput };
    setMessages((prev) => [...prev, newUserMessage]);
    setLoading(true);
    setError("");
  
    try {
      const answerResponse = await axios.post(`/api/interview/${id}/answer`, {
        answer: userInput,
        requestMore,
      });
  
  if (answerResponse.data.isComplete) {
        const endMessage = {
          role: "bot",
          content: "That was the final question. Your interview is now complete. You can view your detailed results.",
          isEnd: true,
        };
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: `Feedback:\n${answerResponse.data.lastEvaluation.overall_feedback ?? "See results."}` },
          endMessage
        ]);
        if (answerResponse.data.isComplete) {
          setTimeout(() => {
            navigate(`/results/${id}`);
          }, 2000);
        }
      } else {
        // fetch status to get next question
        const statusResponse = await axios.get(`/api/interview/${id}/status`);
        interviewData.current = statusResponse.data;

      const feedback = answerResponse.data.lastEvaluation;
        const feedbackMessage = {
          role: "bot",
          content: `Thanks for your answer.\n\nScore: ${feedback.score}/10\nStrengths: ${feedback.strengths.join(", ")}\nAreas for Improvement: ${feedback.weaknesses.join(", ")}`,
        };
        const nextQuestion = {
          role: "bot",
         content: `Next question:\n\n${answerResponse.data.currentQuestion || statusResponse.data.currentQuestion}`,
        };
        setMessages((prev) => [...prev, feedbackMessage, nextQuestion]);
    setQuestionCount(statusResponse.data.questionNumber ?(prev => prev + 1) : 1);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit answer");
    } finally {
      setLoading(false);
    }
  };


  const handleViewResults = () => {
    navigate(`/results/${id}`);
  };

  const handleDownloadPDF = () => {
    window.open(`/api/interview/${id}/export/pdf`, "_blank");
  };

  if (interviewEnded) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: "center" }}>
          <CheckCircle
            size={64}
            color="#28a745"
            style={{ marginBottom: "20px" }}
          />
          <h2>Interview Complete!</h2>
          <p>Redirecting to results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.interviewContainer}>
  <div className={styles.interviewHeader}>
    <button onClick={() => navigate("/")} className={styles.backButton}>
      <ArrowLeft size={20} />
      End Interview
    </button>
    {interviewData.current && (
      <div className={styles.headerInfo}>
        <span>{interviewData.current.role}</span>
        <span>{interviewData.current.domain}</span>
      </div>
    )}
  </div>
  <ChatBot
    messages={messages}
    onSendMessage={handleSendMessage}
    loading={loading}
    disabled={interviewEnded}
  />
</div>

  );
};

export default InterviewPage;



