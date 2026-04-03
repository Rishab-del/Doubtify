import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
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
  <li><Link to="/">Home</Link></li>          {/* landing */}
  <li><Link to="/features">Features</Link></li>
  <li><Link to="/dashboard">Dashboard</Link></li> {/* actual app */}
</ul>
      {/* Button */}
      <button className="get-btn">Get Started</button>

    </nav>
  );
}