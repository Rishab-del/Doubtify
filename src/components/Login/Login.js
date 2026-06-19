import React, { useState } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("⚠️ Please fill all fields");
      return;
    }

    try {
      const res = await fetch("https://doubtify-0q6d.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {

  localStorage.removeItem("currentChatId");


  localStorage.setItem(

    "user",

    JSON.stringify(data.user)

  );

  toast.success("✅ " + data.message);

  navigate("/dashboard");

}else {
        toast.error("❌ " + data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Server error");
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      toast.error("📧 Please enter your email first");
    } else {
      toast.info(
        `📨 Reset link will be sent to ${email}`
      );
    }
  };

  const handleGoogleLogin = () => {
    toast.info("🚀 Google Login Coming Soon");
  };

  const handleFacebookLogin = () => {
    toast.info("🚀 Facebook Login Coming Soon");
  };

  return (
    <div className="login-page">
      <h1 className="welcome">
        Welcome to Doubtify 🚀
      </h1>

      <form
        className="login-form"
        onSubmit={handleSubmit}
      >
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
        />

        <div className="forgot">
          <span onClick={handleForgotPassword}>
            Forgot Password?
          </span>
        </div>

        <button
          type="submit"
          className="login-btn"
        >
          Login
        </button>

        <div className="divider">
          <span>OR</span>
          <span className="line">
            continue with
          </span>
        </div>

        <div className="social-login">
          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleLogin}
          >
            <FaGoogle /> Google
          </button>

          <button
            type="button"
            className="fb-btn"
            onClick={handleFacebookLogin}
          >
            <FaFacebook /> Facebook
          </button>
        </div>
      </form>

      <div className="signup-link">
        <p>
          Don't have an account?{" "}
          <span
            onClick={() =>
              navigate("/signup")
            }
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}