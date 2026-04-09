import React, { useState } from "react";
import "./Discussion.css";
import Navbar from "../Home/Navbar";
import BackButton from "../Home/Offcanvas/BackButton";

export default function Discussion() {
  const [doubts, setDoubts] = useState([]);
  const [input, setInput] = useState("");

  const username = "You"; // baad me auth se dynamic kar lena

  const handlePost = () => {
    if (!input) return;

    const newDoubt = {
      text: input,
      user: username,
      time: new Date().toLocaleTimeString()
    };

    setDoubts([...doubts, newDoubt]);
    setInput("");
  };

  return (
    <div className="discussion-container">
      <BackButton />
      <Navbar />

      <h2 className="heading">💬 Discussion Panel</h2>

      {/* INPUT BOX */}
      <div className="post-box">
        <input
          type="text"
          placeholder="Ask your doubt..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={handlePost}>Send</button>
      </div>

      {/* MESSAGES */}
      <div className="doubt-list">
        {doubts.length === 0 ? (
          <p className="empty">No discussions yet 🚀</p>
        ) : (
          doubts.map((d, i) => (
            <div
              key={i}
              className={`doubt-card ${d.user === "You" ? "right" : "left"}`}
            >
              <p className="message">{d.text}</p>

              <div className="meta">
                <span className="user">{d.user}</span>
                <span className="time">{d.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}