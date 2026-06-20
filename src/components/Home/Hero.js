import React from "react";
import "./Hero.css";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">

      <div className="hero-content">

        <span className="hero-badge">
          🚀 AI Powered Learning Platform
        </span>

        <h1>
          Solve Your Doubts
          <span> Instantly </span>
          with AI
        </h1>

        <p>
          Get accurate step-by-step solutions for
          Coding, Mathematics, Science and Aptitude
          questions in seconds.
        </p>

        <div className="hero-features">
          <div>🤖 AI Doubt Solver</div>
          <div>📚 Smart Notes</div>
          <div>📈 Progress Tracking</div>
          <div>👥 Community Discussions</div>
        </div>

        <div className="buttons">

          <button
            className="primary-btn"
            onClick={() =>
              navigate("/dashboard/aichat")
            }
          >
            Ask AI Now 🤖
          </button>

          <button
            className="secondary-btn"
            onClick={() =>
              navigate("/features")
            }
          >
            Explore Features ✨
          </button>

        </div>

        <div className="hero-stats">
          <div>
            <h3>24/7</h3>
            <span>Available</span>
          </div>

          <div>
            <h3>1000+</h3>
            <span>Doubts Solved</span>
          </div>

          <div>
            <h3>AI</h3>
            <span>Powered</span>
          </div>
        </div>

      </div>

    </section>
  );
}