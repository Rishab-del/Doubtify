import React, { useState } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import {
  FaGoogle,
  FaFacebook,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const API_URL = "https://doubtify-0q6d.onrender.com";

  // EMAIL AND PASSWORD LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("⚠️ Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.user) {
        toast.error(data.message || "Login failed");
        return;
      }

      localStorage.removeItem("currentChatId");

      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("✅ " + data.message);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      toast.error("❌ Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // FORGOT PASSWORD
  const handleForgotPassword = () => {
    if (!email.trim()) {
      toast.error("📧 Please enter your email first");
      return;
    }

    toast.info(
      `Password reset functionality is not configured yet for ${email.trim()}`
    );
  };

  // GOOGLE LOGIN
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      // Step 1: Firebase authentication
      const result = await signInWithPopup(auth, provider);

      const googleUser = result.user;

      if (!googleUser.email) {
        toast.error("Google account email was not received");
        return;
      }

      console.log("Firebase Google authentication successful");

      // Step 2: Save/find user in backend MongoDB
      const res = await fetch(`${API_URL}/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: googleUser.displayName || "Google User",
          email: googleUser.email,
          profilePic: googleUser.photoURL || "",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.user) {
        console.error("Google backend error:", data);

        toast.error(
          data.message || "Google login failed on server"
        );
        return;
      }

      // Step 3: Store user details
      localStorage.removeItem("currentChatId");

      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Google Login Successful ✅");
      navigate("/dashboard");
    } catch (err) {
      console.error("Google Login Error:", err);

      if (err.code === "auth/popup-closed-by-user") {
        toast.info("Google login popup was closed");
      } else if (err.code === "auth/popup-blocked") {
        toast.error("Browser blocked the Google login popup");
      } else if (err.code === "auth/unauthorized-domain") {
        toast.error(
          "This domain is not authorized in Firebase"
        );
      } else if (err.code === "auth/operation-not-allowed") {
        toast.error(
          "Google sign-in is not enabled in Firebase"
        );
      } else if (err.code === "auth/network-request-failed") {
        toast.error("Network error. Please try again.");
      } else {
        toast.error(
          err.message || "Google Login Failed ❌"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // FACEBOOK LOGIN
  const handleFacebookLogin = () => {
    toast.info("🚀 Facebook Login Coming Soon");
  };

  return (
    <div className="login-page">
      <h1 className="welcome">
        Welcome to Doubtify 🚀
      </h1>

      <form className="login-form" onSubmit={handleSubmit}>
        {/* EMAIL */}
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        {/* PASSWORD WITH SHOW/HIDE */}
        <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <span
            className="password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            role="button"
            tabIndex={0}
            aria-label={showPassword ? "Hide password" : "Show password"}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowPassword((prev) => !prev);
              }
            }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* FORGOT PASSWORD */}
        <div className="forgot">
          <span onClick={handleForgotPassword}>
            Forgot Password?
          </span>
        </div>

        {/* LOGIN BUTTON */}
        <button
          type="submit"
          className="login-btn"
          disabled={loading}
        >
          {loading ? "Please wait..." : "Login"}
        </button>

        {/* DIVIDER */}
        <div className="divider">
          <span>OR</span>
          <span className="line">continue with</span>
        </div>

        {/* SOCIAL LOGIN */}
        <div className="social-login">
          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <FaGoogle /> Google
          </button>

          <button
            type="button"
            className="fb-btn"
            onClick={handleFacebookLogin}
            disabled={loading}
          >
            <FaFacebook /> Facebook
          </button>
        </div>
      </form>

      {/* SIGNUP LINK */}
      <div className="signup-link">
        <p>
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")}>
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}