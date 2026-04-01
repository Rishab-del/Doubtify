import React from 'react'
import { Link } from "react-router-dom";
import Offcanvas from "./Offcanvas";

export default function Navbar() {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-4">
        <div className="container-fluid">

          {/* Sidebar trigger */}
          <button 
            className="navbar-brand btn btn-link text-white text-decoration-none"
            data-bs-toggle="offcanvas" 
            data-bs-target="#sidebar">

            Doubtify
          </button>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            
            <ul className="navbar-nav me-auto">

              <li className="nav-item">
                <Link className="nav-link active" to="/home">Home</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/link">chat bot</Link>
              </li>

              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown">
                  more 
                </a>

                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/action">Action</Link></li>
                  <li><Link className="dropdown-item" to="/another">Another action</Link></li>
                </ul>
              </li>

            </ul>

            <form className="d-flex">
              <input className="form-control me-4" type="search" placeholder="Search"/>
              <button className="btn btn-outline-success">Search</button>
            </form>

          </div>
        </div>
      </nav>

      <Offcanvas />
    </>
  )
}