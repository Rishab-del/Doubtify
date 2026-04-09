import React, { useState, useEffect } from "react";
import "./Notes.css";
import BackButton from "./BackButton";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

export default function Notes() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);

  // 📥 Load notes from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("notes")) || [];
    setNotes(saved);
  }, []);

  // 📤 Upload PDF
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newNote = {
      id: Date.now(),
      title: file.name,
      desc: "Uploaded PDF",
      file: URL.createObjectURL(file), // 🔥 temporary URL
    };

    const updated = [...notes, newNote];
    setNotes(updated);
    localStorage.setItem("notes", JSON.stringify(updated));
  };

  // ❌ Delete note
  const handleDelete = (id) => {
    const updated = notes.filter((note) => note.id !== id);
    setNotes(updated);
    localStorage.setItem("notes", JSON.stringify(updated));
  };

  return (
    <>
      <Navbar />
      <BackButton />

     <div className="dashboard">
  <h1 className="dashboard-title">My Notes 📘</h1>

  {/* Upload */}
  <div className="upload-section">
    <input type="file" accept="application/pdf" onChange={handleUpload} />
  </div>

  {/* GRID */}
  <div className="dashboard-grid">
    {notes.map((note) => (
      <div
        className="dashboard-card"
        key={note.id}
        onClick={() => navigate(`/pdf?file=${note.file}`)}
      >
        <div className="card-header">
          <h2>{note.title}</h2>

          <button
            className="delete-btn"
            onClick={() =>
  navigate("/pdf", {
    state: { file: note.file },
  })
}
          >
            ✖
          </button>
        </div>

        <p>{note.desc}</p>
      </div>
    ))}
  </div>
</div>
    </>
  );
}