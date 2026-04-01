import React, { useState } from 'react';
import "./login.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // basic validation (optional)
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    // redirect
    navigate("/home");
  };

  return (
    <div className="login-page">
      
      <h1 className="welcome">Welcome to Doubtify 🚀</h1>

      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>  

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">
          Login
        </button>
      </form>

    </div>
  );
}