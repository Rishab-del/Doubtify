import React from "react";
import "./Plans.css";
import Navbar from "../Home/Navbar";

export default function Plans() {
  return (
    <div className="plans-page">
      <Navbar />

      <h1 className="plans-title">Choose Your Plan 🚀</h1>

      <div className="plans-container">

        {/* FREE PLAN */}
        <div className="plan-card">
          <h2>Free</h2>
          <h3>₹0</h3>
          <p>Basic features to get started</p>

          <ul>
            <li>✔ Limited Doubts</li>
            <li>✔ Basic Notes</li>
            <li>❌ No AI Priority</li>
          </ul>

          <button className="plan-btn">Start Free</button>
        </div>

        {/* MONTHLY PLAN */}
        <div className="plan-card popular">
          <h2>Monthly</h2>
          <h3>₹199/month</h3>
          <p>Best for regular learners</p>

          <ul>
            <li>✔ Unlimited Doubts</li>
            <li>✔ Smart Notes</li>
            <li>✔ AI Assistant</li>
          </ul>

          <button className="plan-btn">Buy Monthly</button>
        </div>

        {/* YEARLY PLAN */}
        <div className="plan-card">
          <h2>Yearly</h2>
          <h3>₹999/year</h3>
          <p>Save more with yearly plan</p>

          <ul>
            <li>✔ Everything in Monthly</li>
            <li>✔ Priority Support</li>
            <li>✔ Extra Features</li>
          </ul>

          <button className="plan-btn">Buy Yearly</button>
        </div>

      </div>
    </div>
  );
}