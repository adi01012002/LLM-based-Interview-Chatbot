import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Star,
  TrendingUp,
  Target,
  BookOpen,
} from "lucide-react";
import axios from "axios";

const ResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      const response = await axios.get(`/api/interview/${id}/results`);
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await axios.get(`/api/interview/${id}/export/pdf`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `interview-report-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to export PDF");
    }
  };

  const getScoreClass = (score) => {
    if (score >= 8) return "score-excellent";
    if (score >= 6) return "score-good";
    if (score >= 4) return "score-fair";
    return "score-poor";
  };

  const getScoreLabel = (score) => {
    if (score >= 8) return "Excellent";
    if (score >= 6) return "Good";
    if (score >= 4) return "Fair";
    return "Needs Improvement";
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="container">
        <div className="card">
          <div className="alert alert-danger">
            {error || "Results not found"}
          </div>
          <button onClick={() => navigate("/")} className="btn">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/")}
          className="btn btn-secondary"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>
      </div>

      {/* Summary Card */}
      <div className="summary-card">
        <div className="summary-title">Interview Complete!</div>
        <div className="summary-score">
          {results.averageScore.toFixed(1)}/10
        </div>
        <div style={{ textAlign: "center", fontSize: "18px", opacity: 0.9 }}>
          {getScoreLabel(results.averageScore)}
        </div>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            onClick={handleExportPDF}
            className="btn"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <Download size={20} />
            Download PDF Report
          </button>
        </div>
      </div>

      {/* Interview Details */}
      <div className="card">
        <h2>Interview Details</h2>
        <div className="grid">
          <div>
            <strong>Role:</strong> {results.role}
          </div>
          <div>
            <strong>Domain:</strong> {results.domain}
          </div>
          <div>
            <strong>Type:</strong>{" "}
            {results.mode.charAt(0).toUpperCase() + results.mode.slice(1)}
          </div>
          <div>
            <strong>Date:</strong>{" "}
            {new Date(results.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Questions and Answers */}
      <div className="card">
        <h2>Questions and Answers</h2>
        {results.questions.map((question, index) => (
          <div
            key={index}
            className="question-card"
            style={{ marginBottom: "20px" }}
          >
            <div className="question-number">Question {index + 1}</div>
            <div className="question-text">{question}</div>

            {results.answers[index] && (
              <div style={{ marginTop: "15px" }}>
                <strong>Your Answer:</strong>
                <div
                  style={{
                    background: "#f8f9fa",
                    padding: "15px",
                    borderRadius: "8px",
                    marginTop: "8px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {results.answers[index]}
                </div>
              </div>
            )}

            {results.evaluations[index] && (
              <div className="feedback-section" style={{ marginTop: "15px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >
                  <h4>Evaluation</h4>
                  <div
                    className={`score ${getScoreClass(
                      results.evaluations[index].score
                    )}`}
                  >
                    {results.evaluations[index].score}/10
                  </div>
                </div>

                {results.evaluations[index].strengths &&
                  results.evaluations[index].strengths.length > 0 && (
                    <div className="feedback-item">
                      <div className="feedback-title">Strengths:</div>
                      <ul className="feedback-list">
                        {results.evaluations[index].strengths.map(
                          (strength, idx) => (
                            <li key={idx}>{strength}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {results.evaluations[index].weaknesses &&
                  results.evaluations[index].weaknesses.length > 0 && (
                    <div className="feedback-item">
                      <div className="feedback-title">
                        Areas for Improvement:
                      </div>
                      <ul className="feedback-list">
                        {results.evaluations[index].weaknesses.map(
                          (weakness, idx) => (
                            <li key={idx}>{weakness}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {results.evaluations[index].suggestions &&
                  results.evaluations[index].suggestions.length > 0 && (
                    <div className="feedback-item">
                      <div className="feedback-title">Suggestions:</div>
                      <ul className="feedback-list">
                        {results.evaluations[index].suggestions.map(
                          (suggestion, idx) => (
                            <li key={idx}>{suggestion}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {results.evaluations[index].overall_feedback && (
                  <div className="feedback-item">
                    <div className="feedback-title">Overall Feedback:</div>
                    <p>{results.evaluations[index].overall_feedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Analysis */}
      {results.summary && (
        <div className="card">
          <h2>Summary Analysis</h2>

          {results.strengths && results.strengths.length > 0 && (
            <div className="summary-section">
              <div className="summary-section-title">
                <Star
                  size={20}
                  style={{ marginRight: "8px", display: "inline" }}
                />
                Key Strengths
              </div>
              <ul className="summary-list">
                {results.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
          )}

          {results.weaknesses && results.weaknesses.length > 0 && (
            <div className="summary-section">
              <div className="summary-section-title">
                <TrendingUp
                  size={20}
                  style={{ marginRight: "8px", display: "inline" }}
                />
                Areas for Improvement
              </div>
              <ul className="summary-list">
                {results.weaknesses.map((weakness, index) => (
                  <li key={index}>{weakness}</li>
                ))}
              </ul>
            </div>
          )}

          {results.recommendations && results.recommendations.length > 0 && (
            <div className="summary-section">
              <div className="summary-section-title">
                <Target
                  size={20}
                  style={{ marginRight: "8px", display: "inline" }}
                />
                Recommendations
              </div>
              <ul className="summary-list">
                {results.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
          )}

          {results.summary.final_feedback && (
            <div className="summary-section">
              <div className="summary-section-title">
                <BookOpen
                  size={20}
                  style={{ marginRight: "8px", display: "inline" }}
                />
                Final Feedback
              </div>
              <p style={{ fontSize: "16px", lineHeight: "1.6" }}>
                {results.summary.final_feedback}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="card" style={{ textAlign: "center" }}>
        <h3>What's Next?</h3>
        <p style={{ marginBottom: "20px" }}>
          Keep practicing to improve your interview skills!
        </p>
        <div
          style={{
            display: "flex",
            gap: "15px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button onClick={() => navigate("/")} className="btn">
            Start New Interview
          </button>
          <button
            onClick={handleExportPDF}
            className="btn btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Download size={20} />
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
