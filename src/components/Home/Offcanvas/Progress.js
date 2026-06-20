import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Progress.css";

import BackButton from "./BackButton";
import Navbar from "../Navbar";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function Progress() {
  const storedUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userId = storedUser?.id;

  const [progress, setProgress] = useState({
    streak: 0,
    doubtsSolved: 0,
    notesCreated: 0,
    totalChats: 0,
  });

useEffect(() => {
  const fetchProgress = async () => {
    try {
      const res = await axios.get(
        `https://doubtify-0q6d.onrender.com/progress/${userId}`
      );

      setProgress(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (userId) {
    fetchProgress();
  }
}, [userId]);

  // Temporary chart data
  const pieData = [
    {
      name: "Doubts",
      value: progress.doubtsSolved,
    },
    {
      name: "Notes",
      value: progress.notesCreated,
    },
    {
      name: "Chats",
      value: progress.totalChats,
    },
  ];

  const COLORS = [
    "#6C63FF",
    "#00C9A7",
    "#FF9800",
  ];

  const barData = [
    {
      name: "Doubts",
      count: progress.doubtsSolved,
    },
    {
      name: "Notes",
      count: progress.notesCreated,
    },
    {
      name: "Chats",
      count: progress.totalChats,
    },
  ];

  return (
    <>
      <BackButton />
      <Navbar />

      <div className="dashboard">

        <h1 className="dashboard-title">
          My Progress 📊
        </h1>

        {/* Stats */}

        <div className="stats-grid">

          <div className="stat-card">
            🔥 {progress.streak} Day Streak
          </div>

          <div className="stat-card">
            📘 {progress.doubtsSolved} Doubts Solved
          </div>

          <div className="stat-card">
            📝 {progress.notesCreated} Notes Uploaded
          </div>

          <div className="stat-card">
            🤖 {progress.totalChats} AI Chats
          </div>

        </div>

        {/* Charts */}

        <div className="charts-grid">

          {/* Pie Chart */}

          <div className="chart-card">

            <h3>
              Activity Distribution
            </h3>

            <PieChart
              width={280}
              height={280}
            >
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label
              >
                {pieData.map(
                  (entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        COLORS[
                          index %
                            COLORS.length
                        ]
                      }
                    />
                  )
                )}
              </Pie>

              <Tooltip />

            </PieChart>

          </div>

          {/* Bar Chart */}

          <div className="chart-card">

            <h3>
              Overall Activity
            </h3>

            <BarChart
              width={350}
              height={280}
              data={barData}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="count"
                fill="#6C63FF"
              />

            </BarChart>

          </div>

        </div>

      </div>
    </>
  );
}