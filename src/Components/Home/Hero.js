import React from "react";
import "./Hero.css";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <div className="hero">
      <h1>Solve Your Doubts Instantly 🚀</h1>

      <p>
        Upload your question and get them  step-by-step solutions in seconds
      </p>

      <div className="buttons">

      <button className="upload-btn" onClick={() => navigate("/upload")}>
        Ask Doubt 🤖
      </button>

      <button className="upload-btn" onClick={() => navigate("/features")}>
        Explore Features ✨
      </button>

      </div>
    </div>
    
  );
}