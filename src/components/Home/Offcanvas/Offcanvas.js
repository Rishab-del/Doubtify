import React from "react";
import { NavLink } from "react-router-dom";
import "./Offcanvas.css";
import { 
  FaHome, 
  FaBook, 
  FaQuestionCircle, 
  FaUserGraduate, 
  FaChartBar, 
  FaCog 
} from "react-icons/fa";

export default function Offcanvas() {
  return (
    <div
      className="offcanvas offcanvas-start custom-sidebar"
      tabIndex="-1"
      id="sidebar"
    >
      <div className="offcanvas-header">
        <button className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
      </div>

      <div className="offcanvas-body">
        <ul className="list-unstyled sidebar-menu">

          <li>
            <NavLink to="/dashboard" className={({isActive}) => isActive ? "active" : ""}>
              <FaHome /> <span>Dashboard</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/my-doubts" className={({isActive}) => isActive ? "active" : ""}>
              <FaQuestionCircle /> <span>My Doubts</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/notes" className={({isActive}) => isActive ? "active" : ""}>
              <FaBook /> <span>Notes</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/progress" className={({isActive}) => isActive ? "active" : ""}>
              <FaChartBar /> <span>Progress</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/profile" className={({isActive}) => isActive ? "active" : ""}>
              <FaUserGraduate /> <span>Profile</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/settings" className={({isActive}) => isActive ? "active" : ""}>
              <FaCog /> <span>Settings</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/login" className={({isActive}) => isActive ? "active" : ""}>
              <FaCog /> <span>Logout</span>
            </NavLink>
          </li>

        </ul>
      </div>
    </div>
  );
}