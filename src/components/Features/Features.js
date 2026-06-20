import React from "react";
import "./Features.css";
import Navbar from "../Home/Navbar";
import { FaRobot, FaBook, FaChartLine, FaBolt, FaUsers, FaCloudUploadAlt } from "react-icons/fa";
import Offcanvas from "../Home/Offcanvas/Offcanvas";

export default function Features() {

  const features = [
    
    {
      icon: <FaRobot />,
      title: "AI Doubt Solver",
      short: "Instant answers to your questions.",
      detail: "Get step-by-step solutions using AI for coding, math, and concepts."
    },
    {
      icon: <FaBook />,
      title: "Smart Notes",
      short: "Organize your study material.",
      detail: "Save notes, upload PDFs, and manage resources easily."
    },
    {
      icon: <FaChartLine />,
      title: "Progress Tracking",
      short: "Track your growth.",
      detail: "Visualize learning with charts, streaks, and analytics."
    },
    {
      icon: <FaBolt />,
      title: "Fast & Clean UI",
      short: "Smooth experience.",
      detail: "Modern design with fast and seamless navigation."
    },
    {
      icon: <FaUsers />,
      title: "Community Discussions",
      short: "Learn with others.",
      detail: "Ask doubts and collaborate with other learners."
    },
    {
      icon: <FaCloudUploadAlt />,
      title: "Cloud Sync",
      short: "Access anywhere.",
      detail: "Your data is सुरक्षित and accessible anytime."
    }
  ];

  return (
    <div className="features-page">
      <Offcanvas/>
      <Navbar />

      <h1 className="features-title">✨ Features</h1>
      <h2 className="features-subtitle">
        Discover the Power of Doubtify's AI-Powered Learning Tools
      </h2>

      <div className="features-container">
        {features.map((f, index) => (
          <div className="feature-card" key={index}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p className="short">{f.short}</p>
            <p className="detail">{f.detail}</p>
          </div>
        ))}
      </div>

    </div>
  );
}