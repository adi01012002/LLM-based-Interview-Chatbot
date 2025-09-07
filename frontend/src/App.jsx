import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import InterviewPage from "./components/InterviewPage";
import ResultsPage from "./components/ResultsPage";
import "./index.css";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/interview/:id" element={<InterviewPage />} />
          <Route path="/results/:id" element={<ResultsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
