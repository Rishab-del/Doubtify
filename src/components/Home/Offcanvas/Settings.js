import React, { useState, useEffect } from "react";
import "./Settings.css";
import BackButton from "./BackButton";
import Navbar from "../Navbar";

export default function Settings() {

  // 🔥 Default settings
  const defaultSettings = {
    notifications: true,
    sound: true,
    popup: true,
    darkMode: false,
    timer: 30,
  };

  const [settings, setSettings] = useState(defaultSettings);

  // 🔥 Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("settings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  // 🔥 Save to localStorage
  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  // 🔥 Dark Mode Apply
  useEffect(() => {
    document.body.classList.toggle("dark", settings.darkMode);
  }, [settings.darkMode]);

  // 🔄 Toggle
  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  // ⏱ Timer
  const handleTimerChange = (e) => {
    setSettings({ ...settings, timer: e.target.value });
  };

  // 🔥 Reset
  const handleReset = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("settings");
  };

  return (
    <>
      <BackButton />

      <div className="settings-page">
        <Navbar />

        <div className="dashboard">
          <h1 className="dashboard-title">Settings ⚙️</h1>

          <div className="settings-container">

            {/* 🔔 Notifications */}
            <div className="setting-item">
              <span>🔔 Notifications</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={() => handleToggle("notifications")}
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* 🔊 Sound */}
            <div className="setting-item">
              <span>🔊 Sound Effects</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.sound}
                  onChange={() => handleToggle("sound")}
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* 💬 Popup */}
            <div className="setting-item">
              <span>💬 Popup Alerts</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.popup}
                  onChange={() => handleToggle("popup")}
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* 🌙 Dark Mode */}
            <div className="setting-item">
              <span>🌙 Dark Mode</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={() => handleToggle("darkMode")}
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* ⏱ Timer */}
            <div className="setting-item">
              <span>⏱ Study Timer (minutes)</span>
              <input
                type="number"
                value={settings.timer}
                onChange={handleTimerChange}
                className="timer-input"
              />
            </div>

            {/* 🔥 Reset */}
            <button className="reset-btn" onClick={handleReset}>
              Reset Settings
            </button>

          </div>
        </div>
      </div>
    </>
  );
}