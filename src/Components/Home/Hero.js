import React from "react";
import "./Hero.css";

export default function Hero() {
  return (
    <div className="hero">
      <h1>Solve Your Doubts Instantly 🚀</h1>

      <p>
        Upload your question and get AI-powered step-by-step solutions in seconds
      </p>

      <div className="buttons">
        <button className="primary">Try Now</button>
        <button className="secondary">Upload Doubt</button>
      </div>
    </div>
  );
}