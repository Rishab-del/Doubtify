import React, { useState } from 'react';
import "./login.css";
import { useNavigate } from "react-router-dom";

export default function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    // ✅ login success
    setIsLoggedIn(true);

    // 👉 dashboard pe bhej do
    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      
      <h1 className="welcome">Welcome to Doubtify 🚀</h1>

      <form className="login-form" onSubmit={handleSubmit}>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">
          Login
        </button>

      </form>

    </div>
  );
}