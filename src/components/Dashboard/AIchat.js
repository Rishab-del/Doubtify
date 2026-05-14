import React, { useState, useRef, useEffect } from "react";
import "./AIchat.css";
import Navbar from "../Home/Navbar";
import BackButton from "../Home/Offcanvas/BackButton";
import { FaMicrophone } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
<<<<<<< HEAD
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

=======
>>>>>>> 5dc8a11 (add new feature in chat bot history store)
import "katex/dist/katex.min.css";

export default function AIchat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  // 🎤 Speech setup
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.onresult = (e) => {
        setInput(e.results[0][0].transcript);
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };
    }
  }, []);

  // 🎤 mic toggle
const handleMic = () => {
  if (!recognitionRef.current) return;

  if (!listening) {
    setListening(true);
    recognitionRef.current.start();
  } else {
    recognitionRef.current.stop();
    setListening(false);
  }
};

  // 🔄 auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 💬 send message
const sendMessage = async () => {
  if (!input.trim()) return;

  setLoading(true);

  const userMsg = { text: input, sender: "user" };
  setMessages((prev) => [...prev, userMsg]);

  const currentInput = input;
  setInput("");

  try {
    const res = await fetch("http://localhost:5001/ask-ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: currentInput }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Server error");
    }
    setMessages((prev) => [
      ...prev,
      {
        text: data.reply,sender: "ai",
      },
    ]);
  } catch (err) {
    setMessages((prev) => [
      ...prev,
      {
        text: err.message || "AI Error ❌",
        sender: "ai",
      },
    ]);
  } finally {
    setLoading(false);
  }
};

  return (
    <>
    <div className="chat-layout"></div>
    
    <div className="chat-container">
      <BackButton />
      <Navbar />
      

      <h2 className="chat-title">🤖 AI Chat Bot</h2>

      <div className="chat-box">
        {messages.length === 0 && (
          <p className="empty-chat">Start conversation 🚀</p>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
  {msg.text}
</ReactMarkdown>
</div>
        ))}

        {loading && (
          <div className="chat-message ai loading">
            <span></span><span></span><span></span>
          </div>
        )}

        {/* 🔄 auto scroll */}
        <div ref={chatEndRef}></div>
      </div>

      <div className="chat-input">
        <div className="input-wrapper">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
          />

          <button
  onClick={handleMic}
  className={`mic-btn ${listening ? "active" : ""}`}
>
  <FaMicrophone />
</button>
        </div>

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
    </>
  );
}