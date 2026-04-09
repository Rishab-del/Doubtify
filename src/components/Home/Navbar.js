import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="custom-navbar">

      {/* Logo */}
    <button
  className="logo-btn"
  data-bs-toggle="offcanvas"
  data-bs-target="#sidebar"
>
  Doubtify 
</button>
      {/* Links */}
   <ul className="nav-links">
  <li><Link to="/home">Home</Link></li>          {/* landing */}
  <li><Link to="/features">Explore</Link></li>
  <li><Link to="/dashboard">Dashboard</Link></li> {/* actual app */}
</ul>
      {/* Button */}
      <button className="get-btn" onClick={() => navigate("/plans")}>
  Upgrade 🔓
</button>

    </nav>
  );
}