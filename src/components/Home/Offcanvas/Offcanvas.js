import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Offcanvas.css";

import {
  FaHome,
  FaBook,
  FaQuestionCircle,
  FaUserGraduate,
  FaChartBar,
  FaSignOutAlt,
  FaExclamationCircle,
  FaTimes,
} from "react-icons/fa";

import BackButton from "./BackButton";

export default function Offcanvas() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(false);
    navigate("/login");
  };

  return (
    <>
      {/* SIDEBAR */}
      <div
        className="offcanvas offcanvas-start custom-sidebar"
        tabIndex="-1"
        id="sidebar"
      >
        <BackButton />

        <div className="offcanvas-header">
          <button
            type="button"
            className="btn-close btn-close-white"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>

        <div className="offcanvas-body">
          <ul className="list-unstyled sidebar-menu">
            <li>
              <NavLink to="/dashboard">
                <FaHome />
                <span>Dashboard</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/my-doubts">
                <FaQuestionCircle />
                <span>My Doubts</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/notes">
                <FaBook />
                <span>Notes</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/progress">
                <FaChartBar />
                <span>Progress</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/profile">
                <FaUserGraduate />
                <span>Profile</span>
              </NavLink>
            </li>
          </ul>

          {/* LOGOUT BUTTON */}
          <button
            type="button"
            className="logout-btn"
            onClick={() => setShowLogoutModal(true)}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* CUSTOM LOGOUT MODAL */}
      {showLogoutModal && (
        <div
          className="logout-modal-overlay"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="logout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              className="logout-modal-close"
              onClick={() => setShowLogoutModal(false)}
              aria-label="Close dialog"
            >
              <FaTimes />
            </button>

            {/* Icon */}
            <div className="logout-modal-icon">
              <FaExclamationCircle />
            </div>

            {/* Content */}
            <h2 id="logout-modal-title">Leaving so soon?</h2>

            <p>
              Are you sure you want to logout from your
              <span> Doubtify </span>
              account?
            </p>

            {/* Actions */}
            <div className="logout-modal-actions">
              <button
                type="button"
                className="logout-cancel-btn"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="logout-confirm-btn"
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}