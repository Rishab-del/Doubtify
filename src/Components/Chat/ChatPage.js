import React, { useState } from "react";
import "./ChatPage.css";
import BackButton from "./Backbutton/BackButton";

export default function ChatPage() {

  const [activeTab, setActiveTab] = useState("discussion");

  return (
    <>
      <BackButton />

      <div className="chat-page">

        <h1>Ask & Discuss 💬</h1>

        {/* 🔥 TABS */}
        <div className="tabs">
          <button 
            className={activeTab === "discussion" ? "active" : ""}
            onClick={() => setActiveTab("discussion")}
          >
            Discussion
          </button>

          <button 
            className={activeTab === "ai" ? "active" : ""}
            onClick={() => setActiveTab("ai")}
          >
            AI Chat 🤖
          </button>
        </div>

        {/* 🔥 CONTENT */}
        {activeTab === "discussion" ? <Discussion /> : <AIChat />}

      </div>
    </>
  );
}