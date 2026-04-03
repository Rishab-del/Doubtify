import React from "react";
import "./Features.css";
import Navbar from "../Home/Navbar";
import { FaRobot, FaBook, FaChartLine, FaBolt } from "react-icons/fa";

export default function Features() {
  return (
    <div className="features-page">

      <Navbar />

      <h1 className="features-title">✨ Features </h1>

      <div className="features-container">

        <div className="feature-card">
  <FaRobot className="feature-icon" />
  <h3>AI Doubt Solver</h3>
  <p>Instant answers to your questions using AI.</p>
</div>

<div className="feature-card">
  <FaBook className="feature-icon" />
  <h3>Smart Notes</h3>
  <p>Organize and access your study notes easily.</p>
</div>

<div className="feature-card">
  <FaChartLine className="feature-icon" />
  <h3>Progress Tracking</h3>
  <p>Track your learning growth and performance.</p>
</div>

<div className="feature-card">
  <FaBolt className="feature-icon" />
  <h3>Fast & Clean UI</h3>
  <p>Enjoy a smooth and distraction-free experience.</p>
</div>
      </div>

    </div>
  );
}