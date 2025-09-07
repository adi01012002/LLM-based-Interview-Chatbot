import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Users, Target, Zap } from "lucide-react";
import axios from "axios";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: "",
    domain: "",
    mode: "technical",
  });
  const [roles, setRoles] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRolesAndDomains();
  }, []);

  const fetchRolesAndDomains = async () => {
    try {
      const [rolesResponse, domainsResponse] = await Promise.all([
        axios.get("https://llm-based-interview-chatbot.onrender.com/api/roles"),
        axios.get("https://llm-based-interview-chatbot.onrender.com/api/domains"),
      ]);

      setRoles(rolesResponse.data.roles);
      setDomains(domainsResponse.data.domains);
    } catch (err) {
      console.error("Error fetching roles and domains:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("https://llm-based-interview-chatbot.onrender.com/api/interview/start", formData);
      const { interviewId } = response.data;
      navigate(`/interview/${interviewId}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>AI Interview Simulator</h1>
        <p>
          Practice your interview skills with AI-powered questions and feedback
        </p>
      </div>

      <div className="grid">
        <div className="card">
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <Brain size={48} color="#667eea" style={{ marginBottom: "15px" }} />
            <h2>Technical Interviews</h2>
            <p>
              Practice coding problems, system design, and technical concepts
            </p>
          </div>
        </div>

        <div className="card">
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <Users size={48} color="#667eea" style={{ marginBottom: "15px" }} />
            <h2>Behavioral Interviews</h2>
            <p>Improve your soft skills and situational responses</p>
          </div>
        </div>

        <div className="card">
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <Target
              size={48}
              color="#667eea"
              style={{ marginBottom: "15px" }}
            />
            <h2>Role-Specific</h2>
            <p>Questions tailored to your target role and industry</p>
          </div>
        </div>

        <div className="card">
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <Zap size={48} color="#667eea" style={{ marginBottom: "15px" }} />
            <h2>Instant Feedback</h2>
            <p>Get detailed feedback and scores after each question</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
          Start Your Interview
        </h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid">
            <div className="form-group">
              <label className="form-label" htmlFor="role">
                Target Role *
              </label>
              <select
                id="role"
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="domain">
                Industry Domain *
              </label>
              <select
                id="domain"
                name="domain"
                className="form-select"
                value={formData.domain}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a domain</option>
                {domains.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="mode">
                Interview Type *
              </label>
              <select
                id="mode"
                name="mode"
                className="form-select"
                value={formData.mode}
                onChange={handleInputChange}
                required
              >
                <option value="technical">Technical Interview</option>
                <option value="behavioral">Behavioral Interview</option>
              </select>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <button
              type="submit"
              className="btn"
              disabled={loading || !formData.role || !formData.domain}
              style={{ fontSize: "18px", padding: "15px 40px" }}
            >
              {loading ? (
                <>
                  <div
                    className="spinner"
                    style={{
                      width: "20px",
                      height: "20px",
                      marginRight: "10px",
                    }}
                  ></div>
                  Starting Interview...
                </>
              ) : (
                "Start Interview"
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
          How It Works
        </h3>
        <div className="grid">
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#667eea",
                marginBottom: "10px",
              }}
            >
              1
            </div>
            <h4>Choose Your Role</h4>
            <p>Select your target position and industry domain</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#667eea",
                marginBottom: "10px",
              }}
            >
              2
            </div>
            <h4>Answer Questions</h4>
            <p>Respond to 5 AI-generated interview questions</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#667eea",
                marginBottom: "10px",
              }}
            >
              3
            </div>
            <h4>Get Feedback</h4>
            <p>Receive detailed feedback and scores for each answer</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#667eea",
                marginBottom: "10px",
              }}
            >
              4
            </div>
            <h4>View Summary</h4>
            <p>Get a comprehensive report with strengths and recommendations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
