import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Splash.css";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/login");
    }, 3000);
  }, [navigate]);

  return (
    <div className="splash-container">
      <img src="/doubtify.png" alt="logo" className="logo-img" />
    </div>
  );
}