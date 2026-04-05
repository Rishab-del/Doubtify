import React, { useState } from "react";
import "./AIchat.css";
import Navbar from "../Home/Navbar";
import BackButton from "../Home/Offcanvas/BackButton";

export default function AIchat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { text: input, sender: "user" },
      { text: "AI reply coming soon 🤖", sender: "ai" }
    ];

    setMessages(newMessages);
    setInput("");
  };

  return (
    <div className="chat-container">
      <BackButton />
      <Navbar />

      <h2 className="chat-title">🤖 AI Chat</h2>

      <div className="chat-box">
        {messages.length === 0 && (
          <p className="empty-chat">Start conversation 🚀</p>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.sender}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>

    </div>
  );
}