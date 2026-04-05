import React from "react";
import { useNavigate } from "react-router-dom";
import "./AIOptions.css";
import Navbar from "../Home/Navbar";

export default function AIOptions() {
  const navigate = useNavigate();

  return (
    <>
    <Navbar />
    <div className="ai-options">
      <h2 className="title">Choose Option 🤖</h2>

      <div className="options-container">
        
        <div
          className="option-card"
          onClick={() => navigate("/dashboard/aichat")}
        >
          <div className="icon">💬</div>
          <h3>AI Chat</h3>
          <p>Chat with AI instantly</p>
        </div>

        <div
          className="option-card"
          onClick={() => navigate("/dashboard/discussion")}
        >
          <div className="icon">🧠</div>
          <h3>Discussion</h3>
          <p>Discuss with others</p>
        </div>

      </div>
    </div>
    </>
  );
}