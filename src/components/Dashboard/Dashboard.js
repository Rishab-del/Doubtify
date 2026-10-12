import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import Navbar from "../Home/Navbar";

import {
  FaQuestionCircle,
  FaBook,
  FaChartLine,
  FaRobot,
  FaCalendarAlt,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

const API_URL = "https://doubtify-0q6d.onrender.com";

// Safely read user data from localStorage
const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");

    if (
      !storedUser ||
      storedUser === "undefined" ||
      storedUser === "null"
    ) {
      return null;
    }

    const user = JSON.parse(storedUser);

    if (!user || typeof user !== "object" || Array.isArray(user)) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Unable to read saved user:", error);
    return null;
  }
};

export default function Dashboard() {
  const navigate = useNavigate();

  // Initialize the user's name from saved data
  const [userName, setUserName] = useState(() => {
    const user = getStoredUser();

    if (user?.name) {
      return user.name;
    }

    try {
      return localStorage.getItem("userName") || "User";
    } catch (error) {
      console.error("Unable to read saved username:", error);
      return "User";
    }
  });

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        // Read the latest user data from localStorage
        const user = getStoredUser();

        if (user?.name && isMounted) {
          setUserName(user.name);
        }

        let savedName = null;

        try {
          savedName = localStorage.getItem("userName");
        } catch (error) {
          console.error("Unable to read saved username:", error);
        }

        if (savedName && isMounted) {
          setUserName(savedName);
        }

        // Fetch the latest profile from the backend
        const response = await fetch(`${API_URL}/profile`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.warn(
            "Profile API unavailable:",
            response.status
          );
          return;
        }

        const data = await response.json();

        if (
          !isMounted ||
          !data?.success ||
          !data?.user?.name
        ) {
          return;
        }

        const latestName = data.user.name;

        // Update the displayed username
        setUserName(latestName);

        // Save the latest username
        try {
          localStorage.setItem("userName", latestName);
        } catch (error) {
          console.error("Unable to save username:", error);
        }

        // Update cached user without deleting other properties
        const currentUser = getStoredUser();

        if (currentUser) {
          try {
            localStorage.setItem(
              "user",
              JSON.stringify({
                ...currentUser,
                name: latestName,
              })
            );
          } catch (error) {
            console.error("Unable to update saved user:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="dashboard">
      <Navbar />

      <h2 className="dashboard-title">
        Welcome {userName}
      </h2>

      <p className="dashboard-subtitle">
        Access your doubts, notes, progress, and AI assistant
        all in one place
      </p>

      <div className="dashboard-cards">
        {/* My Doubts */}
        <div
          className="card"
          onClick={() => navigate("/my-doubts")}
        >
          <FaQuestionCircle className="card-icon" />
          <h3>My Doubts</h3>
          <p>Track and solve your doubts easily</p>
        </div>

        {/* Notes */}
        <div
          className="card"
          onClick={() => navigate("/notes")}
        >
          <FaBook className="card-icon" />
          <h3>Notes</h3>
          <p>Access your saved study notes</p>
        </div>

        {/* Progress */}
        <div
          className="card"
          onClick={() => navigate("/progress")}
        >
          <FaChartLine className="card-icon" />
          <h3>Progress</h3>
          <p>Check your learning growth</p>
        </div>

        {/* AI Assistant */}
        <div
          className="card"
          onClick={() => navigate("/dashboard/ai-options")}
        >
          <FaRobot className="card-icon" />
          <h3>AI Assistant</h3>
          <p>Ask anything instantly</p>
        </div>

        {/* Calendar */}
        <div
          className="card"
          onClick={() => navigate("/calendar")}
        >
          <FaCalendarAlt className="card-icon" />
          <h3>Calendar</h3>
          <p>Manage exams and reminders</p>
        </div>
      </div>
    </div>
  );
}