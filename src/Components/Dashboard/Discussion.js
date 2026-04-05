import React, { useState } from "react";
import "./Discussion.css";
import { FaRobot } from "react-icons/fa";
import Navbar from "../Home/Navbar";
import BackButton from "../Home/Offcanvas/BackButton";

export default function Discussion() {
  const [doubts, setDoubts] = useState([]);
  const [input, setInput] = useState("");



  const handlePost = () => {
    if (!input) return;

    setDoubts([...doubts, input]);
    setInput("");
  };

  return (
    <div className="discussion-container">
      <BackButton />
      <Navbar />
      <h2>💬 Discussion with Your Friends</h2>

      <div className="post-box">
        <input
          type="text"
          placeholder="Post your doubt..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={handlePost}>Post</button>
      </div>

      <div className="doubt-list">
        {doubts.length === 0 ? (
          <p>No discussions yet</p>
        ) : (
          doubts.map((d, i) => (
            <div key={i} className="doubt-card">
              {d}
            </div>
          ))
        )}
      </div>

    </div>
  );
}