import React from 'react'
import { Link } from "react-router-dom";
import Login from '../Login/Login';


export default function Offcanvas() {
  return (
    <div className="offcanvas offcanvas-start text-bg-dark" tabIndex="-1" id="sidebar">
      
      <div className="offcanvas-header">
        <h5 className="offcanvas-title">Doubtify Menu</h5>
        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
      </div>

      <div className="offcanvas-body">
        <ul className="navbar-nav">

          <li className="nav-item">
            <Link className="nav-link" to="/home">🏠 Home</Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/profile">👤 Profile</Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/settings">⚙️ Settings</Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link text-danger"  to="/logout">🚪 Logout</Link>
          </li>

        </ul>
      </div>
    </div>
  )
}