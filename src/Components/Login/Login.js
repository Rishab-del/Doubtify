import React, { useState } from 'react';
import "./login.css";
import { useNavigate } from "react-router-dom";
import { FaGoogle, FaFacebook } from "react-icons/fa";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }
    navigate("/dashboard");
  };

  // 🔥 Forgot Password
  const handleForgotPassword = () => {
    if (!email) {
      alert("Enter your email first 📧");
    } else {
      alert("Reset link sent to " + email);
    }
  };

  // 🔥 Social Login (dummy)
  const handleGoogleLogin = () => {
    alert("Google login coming soon 🚀");
  };

  const handleFacebookLogin = () => {
    alert("Facebook login coming soon 🚀");
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

        {/* 🔥 Forgot Password */}
        <div className="forgot">
          <span onClick={handleForgotPassword}>
            Forgot Password?
          </span>
        </div>

        <button type="submit" className="login-btn">
          Login
        </button>

        {/* Divider */}
        <div className="divider">
          <span>OR</span>
          
          <span className="line">continue with </span>
        </div>

       <div className="social-login">
  <button type="button" className="google-btn" onClick={handleGoogleLogin}>
    <FaGoogle /> Google
  </button>

  <button type="button" className="fb-btn" onClick={handleFacebookLogin}>
    <FaFacebook />Facebook
  </button>
</div>

      </form>

    </div>
  );
}
