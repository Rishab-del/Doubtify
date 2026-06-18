import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./AIchat.css";

import Navbar from "../Home/Navbar";
import BackButton from "../Home/Offcanvas/BackButton";

import { FaMicrophone } from "react-icons/fa";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";

export default function AIchat() {
  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  const [listening, setListening] = useState(false);

  const [chatList, setChatList] = useState([]);

  const [currentChatId, setCurrentChatId] = useState(null);

  const [temporaryMode, setTemporaryMode] = useState(false);

  const recognitionRef = useRef(null);

  const chatEndRef = useRef(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeaders = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [navigate, token]);

  /* 🎤 Speech setup */
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

  /* 🎤 Mic Toggle */
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

  /* 🔄 Auto Scroll */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /* 📂 Fetch All Chats */
  const fetchAllChats = async () => {
    try {
      const res = await fetch("https://doubtify-0q6d.onrender.com/all-chats", {
        method: "GET",
        headers: {
          ...authHeaders,
        },
      });

      const data = await res.json();

      setChatList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllChats();
    }
  }, [token]);

  /* 🔄 Load selected chat */
  useEffect(() => {
    const loadSelectedChat = async () => {
      const savedChatId = localStorage.getItem("currentChatId");

      if (!savedChatId || !token) return;

      try {
        const res = await fetch(
          `https://doubtify-0q6d.onrender.com/chat-by-id/${savedChatId}`,
          {
            headers: {
              ...authHeaders,
            },
          }
        );

        const data = await res.json();

        if (data?.messages) {
          setMessages(data.messages);

          setCurrentChatId(savedChatId);
        }
      } catch (err) {
        console.log(err);
      }
    };

    loadSelectedChat();
  }, [token]);

  /* 💬 Send Message */
  const sendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);

    const currentInput = input;

    const userMsg = {
      text: currentInput,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMsg]);

    setInput("");

    try {
      const res = await fetch("https://doubtify-0q6d.onrender.com/ask-ai", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },

        body: JSON.stringify({
          question: currentInput,

          history: messages,

          chatId: currentChatId,

          temporary: temporaryMode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Server error");
      }

      /* AI MESSAGE */
      setMessages((prev) => [
        ...prev,
        {
          text: data.reply,
          sender: "ai",
        },
      ]);

      setCurrentChatId(data.chatId);
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
    <div className="main-layout">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-top">
          <button
            className="new-chat-btn"
            onClick={() => {
              setMessages([]);

              setCurrentChatId(null);

              localStorage.removeItem("currentChatId");
            }}
          >
            + New Chat
          </button>

          <div className="temp-chat-toggle">
            <span>Temporary Chat</span>

            <input
              type="checkbox"
              checked={temporaryMode}
              onChange={() => {
                const updatedValue = !temporaryMode;

                setTemporaryMode(updatedValue);

                if (temporaryMode === true) {
                  setMessages([]);

                  setCurrentChatId(null);

                  localStorage.removeItem("currentChatId");
                }
              }}
            />
          </div>
        </div>

        {/* CHAT HISTORY */}
        <div className="chat-history">
          {Array.isArray(chatList) &&
            chatList.map((chat) => (
              <div key={chat._id} className="chat-item">
                <span
                  className="chat-title-text"
                  onClick={async () => {
                    const res = await fetch(
                      `https://doubtify-0q6d.onrender.com/chat-by-id/${chat._id}`,
                      {
                        headers: {
                          ...authHeaders,
                        },
                      }
                    );

                    const data = await res.json();

                    setMessages(data.messages);

                    setCurrentChatId(chat._id);

                    localStorage.setItem("currentChatId", chat._id);
                  }}
                >
                  {chat.title}
                </span>

                <button
                  className="delete-btn"
                  onClick={async (e) => {
                    e.stopPropagation();

                    await fetch(
                      `https://doubtify-0q6d.onrender.com/delete-chat/${chat._id}`,
                      {
                        method: "DELETE",
                        headers: {
                          ...authHeaders,
                        },
                      },
                    );

                    setChatList((prev) =>
                      prev.filter((c) => c._id !== chat._id),
                    );

                    if (currentChatId === chat._id) {
                      setMessages([]);

                      setCurrentChatId(null);

                      localStorage.removeItem("currentChatId");
                    }
                  }}
                >
                  🗑
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* MAIN CHAT */}
      <div className="chat-container">
        <BackButton />
        <Navbar />

        <h2 className="chat-title">🤖 AI Assistant</h2>

        {/* CHAT BOX */}
        <div className="chat-box">
          {messages.length === 0 && (
            <p className="empty-chat">Start conversation 🚀</p>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender}`}>
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          ))}

          {loading && (
            <div className="chat-message ai loading">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        {/* INPUT */}
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
    </div>
  );
}
