import React from "react";
import "./Dashboard.css";
import Navbar from "../Home/Navbar";
import { FaQuestionCircle, FaBook, FaChartLine, FaRobot } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="dashboard">

      <Navbar />


      <h2 className="dashboard-title">Your Learning Hub</h2>
      <p className="dashboard-subtitle">
        Access your doubts, notes, progress, and AI assistant all in one place
      </p>

      <div className="dashboard-cards">

        <div className="card" onClick={() => navigate("/my-doubts")}>
          <FaQuestionCircle className="card-icon" />
          <h3>My Doubts</h3>
          <p>Track and solve your doubts easily</p>
        </div>

        <div className="card" onClick={() => navigate("/notes")}>
          <FaBook className="card-icon" />
          <h3>Notes</h3>
          <p>Access your saved study notes</p>
        </div>

        <div className="card" onClick={() => navigate("/progress")}>
          <FaChartLine className="card-icon" />
          <h3>Progress</h3>
          <p>Check your learning growth</p>
        </div>

        <div className="card" onClick={() => navigate("./ai-options")}>
          <FaRobot className="card-icon" />
          <h3>AI Assistant</h3>
          <p>Ask anything instantly</p>
        </div>

      </div>

    </div>
  );
}