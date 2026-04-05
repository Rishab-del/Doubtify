import React from "react";
import "./Progress.css";
import BackButton from "./BackButton";
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

export default function Progress() {

  // 📊 Pie Data (Topics)
  const pieData = [
    { name: "React", value: 40 },
    { name: "JavaScript", value: 30 },
    { name: "DSA", value: 20 },
    { name: "Others", value: 10 },
  ];

  const COLORS = ["#6C63FF", "#00C9A7", "#ff9800", "#ff4d4d"];

  // 📊 Bar Data (Study Hours)
  const barData = [
    { day: "Mon", hours: 2 },
    { day: "Tue", hours: 3 },
    { day: "Wed", hours: 1.5 },
    { day: "Thu", hours: 4 },
    { day: "Fri", hours: 2.5 },
    { day: "Sat", hours: 5 },
    { day: "Sun", hours: 3 },
  ];

  return (
    <>
      <BackButton />

      <div className="dashboard">

        <h1 className="dashboard-title">My Progress 📊</h1>

        {/* 🔥 STATS */}
        <div className="stats-grid">
          <div className="stat-card">🔥 7 Day Streak</div>
          <div className="stat-card">📘 12 Doubts Solved</div>
          <div className="stat-card">📝 8 Notes Created</div>
        </div>

        {/* 🔥 CHARTS */}
        <div className="charts-grid">

          {/* PIE */}
          <div className="chart-card">
            <h3>Topic Distribution</h3>
            <PieChart width={250} height={250}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>

          {/* BAR */}
          <div className="chart-card">
            <h3>Weekly Study Hours</h3>
            <BarChart width={300} height={250} data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill="#6C63FF" />
            </BarChart>
          </div>

        </div>

      </div>
    </>
  );
}