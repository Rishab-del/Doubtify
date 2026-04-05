import React from "react";
import "./Features.css";
import Navbar from "../Home/Navbar";
import { FaRobot, FaBook, FaChartLine, FaBolt } from "react-icons/fa";
import { FaUsers, FaCloudUploadAlt } from "react-icons/fa";

export default function Features() {
  return (
    <div className="features-page">

      <Navbar />

      <h1 className="features-title">✨ Features</h1>
      <h2 className="features-subtitle">
        Discover the Power of Doubtify's AI-Powered Learning Tools
      </h2>

      <div className="features-container">

        <div className="feature-card">
          <FaRobot className="feature-icon" />
          <h3>AI Doubt Solver</h3>
          <p className="short">Instant answers to your questions.</p>

          <p className="detail">
            Get step-by-step solutions for your doubts using advanced AI.
            Supports coding, math, and conceptual queries with real-time responses.
          </p>
        </div>

        <div className="feature-card">
          <FaBook className="feature-icon" />
          <h3>Smart Notes</h3>
          <p className="short">Organize your study material.</p>

          <p className="detail">
            Save notes, upload PDFs, and access everything in one place.
            Easily manage and search your learning resources anytime.
          </p>
        </div>

        <div className="feature-card">
          <FaChartLine className="feature-icon" />
          <h3>Progress Tracking</h3>
          <p className="short">Track your growth.</p>

          <p className="detail">
            Visualize your learning progress with charts and analytics.
            Stay motivated with streaks and performance insights.
          </p>
        </div>

        <div className="feature-card">
          <FaBolt className="feature-icon" />
          <h3>Fast & Clean UI</h3>
          <p className="short">Smooth experience.</p>

          <p className="detail">
            Enjoy a distraction-free interface with modern design,
            fast loading, and seamless navigation across the app.
          </p>
        </div>
        <div className="feature-card">
    <FaUsers className="feature-icon" />
    <h3>Community Discussions</h3>
    <p className="short">Learn with others.</p>
    <p className="detail">
      Ask doubts, share ideas, and collaborate with other learners.
      Get multiple perspectives and improve your understanding faster.
    </p>
  </div>

  {/* 🔥 NEW 2 */}
  <div className="feature-card">
    <FaCloudUploadAlt className="feature-icon" />
    <h3>Cloud Sync</h3>
    <p className="short">Access anywhere.</p>
    <p className="detail">
      Your notes and progress are securely stored in the cloud.
      Access your data anytime from any device seamlessly.
    </p>
  </div>


      </div>

    </div>
  );
}