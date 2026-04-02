import React from "react";
import { Link } from "react-router-dom";
import "./Offcanvas.css";

export default function Offcanvas() {
  return (
    <div
      className="offcanvas offcanvas-start"
      tabIndex="-1"
      id="sidebar"
    >
      <div className="offcanvas-header" >
        <h5>Main Menu</h5>
        <button className="btn-close" data-bs-dismiss="offcanvas"></button>
      </div>

      <div className="offcanvas-body">
        <ul className="list-unstyled">

          <li><Link to="/home" className="d-block py-2">🏠 Home</Link></li>
          <li><Link to="#" className="d-block py-2">✨ Features</Link></li>
          <li><Link to="#" className="d-block py-2">⚙️ How It Works</Link></li>
          <li><Link to="/login" className="d-block py-2">🔐 Login</Link></li>

        </ul>
      </div>
    </div>
  );
}