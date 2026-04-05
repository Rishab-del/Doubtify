import React, { useState } from "react";
import "./Settings.css";
import BackButton from "./BackButton";

export default function Settings() {

  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    popup: true,
    darkMode: false,
    timer: 30,
  });

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleTimerChange = (e) => {
    setSettings({ ...settings, timer: e.target.value });
  };

  return (
    <>
      <BackButton />

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

          {/* 💬 Popups */}
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

          {/* 🔥 RESET */}
          <button className="reset-btn">
            Reset Settings
          </button>

        </div>

      </div>
    </>
  );
}