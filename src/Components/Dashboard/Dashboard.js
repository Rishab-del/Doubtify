import React from "react";
import "./Dashboard.css";
import Navbar from "../Home/Navbar";
import { FaQuestionCircle, FaBook, FaChartLine, FaRobot } from "react-icons/fa";

export default function Dashboard() {
  return (
    <div className="dashboard">

      <Navbar />

      <h2 className="dashboard-title">Dashboard </h2>

      <div className="dashboard-cards">

        <div className="card">
          <FaQuestionCircle className="card-icon" />
          <h3>My Doubts</h3>
          <p>Track and solve your doubts easily</p>
        </div>

        <div className="card">
          <FaBook className="card-icon" />
          <h3>Notes</h3>
          <p>Access your saved study notes</p>
        </div>

        <div className="card">
          <FaChartLine className="card-icon" />
          <h3>Progress</h3>
          <p>Check your learning growth</p>
        </div>

        <div className="card">
          <FaRobot className="card-icon" />
          <h3>AI Assistant</h3>
          <p>Ask anything instantly</p>
        </div>

      </div>

    </div>
  );
}