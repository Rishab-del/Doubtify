import React, { useState } from "react";
import "./FloatingChat.css";

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi 👋 How can I help you?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { text: input, sender: "user" };

    const botMsg = {
      text: "🤖 I'm your assistant (AI coming soon 🚀)",
      sender: "bot"
    };

    setMessages([...messages, userMsg, botMsg]);
    setInput("");
  };

  return (
    <div>
      {/* 🔥 Floating Button */}
      <div className="chat-toggle" onClick={() => setOpen(!open)}>
        💬
      </div>

      {/* 🔥 Chat Box */}
      {open && (
        <div className="chat-box">

          <div className="chat-header">
            AI Assistant 🤖
            <span onClick={() => setOpen(false)}>✖</span>
          </div>

          <div className="chat-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={msg.sender === "user" ? "user-msg" : "bot-msg"}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-footer">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={handleSend}>Send</button>
          </div>

        </div>
      )}
    </div>
  );
}