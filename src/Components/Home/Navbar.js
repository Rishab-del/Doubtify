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
        <li><Link to="/home">Home</Link></li>
        <li><Link to="#">Features</Link></li>
        <li><Link to="#">How It Works</Link></li>
        <li><Link to="/login">Login</Link></li>
      </ul>

      {/* Button */}
      <button className="get-btn">Get Started</button>

    </nav>
  );
}