import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Splash.css";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const id = setTimeout(() => {
      navigate("/home");
    }, 2000);
    return () => clearTimeout(id);
  }, [navigate]);

  return (
    <div className="splash-container">
      <img src="/doubtify.png" alt="logo" className="logo-img" />
    </div>
  );
}