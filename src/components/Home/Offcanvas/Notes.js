import React, { useState, useEffect } from "react";
import "./Notes.css";
import BackButton from "./BackButton";
import Navbar from "../Navbar";
import { useDropzone } from "react-dropzone";
import axios from "axios";

export default function Notes() {
  const [notes, setNotes] = useState([]);

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* =========================
     FETCH NOTES
  ========================= */

  const fetchNotes = async () => {
    try {
      const res = await axios.get(
        "https://doubtify-0q6d.onrender.com/notes"
      );

      setNotes(res.data);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  /* =========================
     LOAD NOTES ON START
  ========================= */

  useEffect(() => {
    fetchNotes();
  }, []);

  /* =========================
     PDF UPLOAD
  ========================= */

  const onDrop = async (acceptedFiles) => {
    for (const file of acceptedFiles) {
      try {
        const formData = new FormData();

        formData.append("file", file);

        await axios.post(
          "https://doubtify-0q6d.onrender.com/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } catch (err) {
        console.error("Error uploading PDF:", err);
      }
    }

    // Refresh notes after upload
    fetchNotes();
  };

  /* =========================
     DROPZONE
  ========================= */

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  /* =========================
     OPEN DELETE MODAL
  ========================= */

  const openDeleteModal = (id) => {
    setSelectedNoteId(id);
    setShowDeleteModal(true);
  };

  /* =========================
     CLOSE DELETE MODAL
  ========================= */

  const closeDeleteModal = () => {
    if (deleting) return;

    setShowDeleteModal(false);
    setSelectedNoteId(null);
  };

  /* =========================
     CONFIRM DELETE NOTE
  ========================= */

  const confirmDeleteNote = async () => {
    if (!selectedNoteId || deleting) return;

    try {
      setDeleting(true);

      await axios.delete(
        `https://doubtify-0q6d.onrender.com/delete-note/${selectedNoteId}`
      );

      // Remove deleted note from UI
      setNotes((prevNotes) =>
        prevNotes.filter(
          (note) => note._id !== selectedNoteId
        )
      );

      // Close modal
      setShowDeleteModal(false);
      setSelectedNoteId(null);
    } catch (err) {
      console.error("Error deleting note:", err);

      window.alert(
        "Unable to delete this note. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  /* =========================
     RENDER UI
  ========================= */

  return (
    <>
      <Navbar />
      <BackButton />

      <div className="dashboard">
        {/* Dashboard Title */}

        <h1 className="dashboard-title">
          My Notes 📘
        </h1>

        {/* ======================
            PDF UPLOAD BOX
        ====================== */}

        <div
          {...getRootProps()}
          className="upload-box"
        >
          <input {...getInputProps()} />

          {isDragActive ? (
            <p>Drop the PDF here...</p>
          ) : (
            <p>+ Drag / Click to Upload</p>
          )}
        </div>

        {/* ======================
            NOTES GRID
        ====================== */}

        <div className="dashboard-grid">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div
                className="dashboard-card"
                key={note._id}
              >
                {/* Note Title */}

                <h2>
                  📄 {note.title}
                </h2>

                {/* File Size */}

                <p>{note.size} MB</p>

                {/* Action Buttons */}

                <div className="btn-group">
                  <button
                    type="button"
                    className="open-btn"
                    onClick={() =>
                      window.open(
                        `https://doubtify-0q6d.onrender.com${note.file}`,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    Open PDF
                  </button>

                  <button
                    type="button"
                    className="delete-btns"
                    onClick={() =>
                      openDeleteModal(note._id)
                    }
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="empty-text">
              No notes uploaded yet 📂
            </p>
          )}
        </div>
      </div>

      {/* =================================
          PREMIUM DELETE CONFIRMATION MODAL
      ================================= */}

      {showDeleteModal && (
        <div
          className="delete-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <div
            className="delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
          >
            {/* Close Button */}

            <button
              type="button"
              className="delete-modal-close"
              onClick={closeDeleteModal}
              disabled={deleting}
              aria-label="Close confirmation"
            >
              ×
            </button>

            {/* Warning Icon */}

            <div className="delete-modal-icon">
              <span>!</span>
            </div>

            {/* Heading */}

            <h2 id="delete-modal-title">
              Delete this note?
            </h2>

            {/* Description */}

            <p id="delete-modal-description">
              Are you sure you want to delete this note?

              <br />

              <span className="delete-warning">
                This action cannot be undone.
              </span>
            </p>

            {/* Action Buttons */}

            <div className="delete-modal-actions">
              <button
                type="button"
                className="delete-cancel-btn"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-confirm-btn"
                onClick={confirmDeleteNote}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="delete-spinner" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <span>🗑</span>
                    Delete Note
                  </>
                )}
              </button>
            </div>

            {/* Footer */}

            <div className="delete-modal-footer">
              <span className="delete-footer-dot" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}