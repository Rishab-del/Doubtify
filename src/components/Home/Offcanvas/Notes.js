import React, { useState, useEffect, useCallback } from "react";
import "./Notes.css";
import BackButton from "./BackButton";
import Navbar from "../Navbar";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const API_URL = "https://doubtify-0q6d.onrender.com";

export default function Notes() {
  // =====================================
  // USER
  // =====================================

  const [userId] = useState(() => {
    try {
      const storedUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      return storedUser?.id || null;
    } catch {
      return null;
    }
  });

  // =====================================
  // STATES
  // =====================================

  const [notes, setNotes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Notification states
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  // =====================================
  // NOTIFICATION
  // =====================================

  const showNotification = useCallback(
    (type, title, message) => {
      setNotification({
        show: true,
        type,
        title,
        message,
      });
    },
    []
  );

  const closeNotification = () => {
    setNotification((prev) => ({
      ...prev,
      show: false,
    }));
  };

  useEffect(() => {
    if (!notification.show) return;

    const timer = setTimeout(() => {
      setNotification((prev) => ({
        ...prev,
        show: false,
      }));
    }, 3500);

    return () => clearTimeout(timer);
  }, [notification]);

  // =====================================
  // FETCH NOTES
  // =====================================

  const fetchNotes = useCallback(async () => {
    if (!userId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `${API_URL}/notes/${encodeURIComponent(userId)}`
      );

      setNotes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching notes:", err);

      showNotification(
        "error",
        "Unable to load notes",
        err.response?.data?.message ||
          "Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [userId, showNotification]);

  // =====================================
  // LOAD NOTES ON START
  // =====================================

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // =====================================
  // PDF UPLOAD
  // =====================================

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (!userId) {
        showNotification(
          "error",
          "Login required",
          "Please log in before uploading notes."
        );

        return;
      }

      if (acceptedFiles.length === 0) {
        return;
      }

      setUploading(true);

      let successfulUploads = 0;
      let failedUploads = 0;

      try {
        for (let i = 0; i < acceptedFiles.length; i++) {
          const file = acceptedFiles[i];

          setUploadProgress(
            `Uploading ${i + 1} of ${acceptedFiles.length}: ${file.name}`
          );

          try {
            const formData = new FormData();

            formData.append("file", file);
            formData.append("userId", userId);

            await axios.post(
              `${API_URL}/upload`,
              formData
            );

            successfulUploads++;
          } catch (err) {
            console.error(
              `Error uploading ${file.name}:`,
              err
            );

            failedUploads++;
          }
        }

        // Refresh notes after upload
        await fetchNotes();

        if (successfulUploads > 0 && failedUploads === 0) {
          showNotification(
            "success",
            "Upload successful!",
            successfulUploads === 1
              ? "Your PDF has been uploaded successfully."
              : `${successfulUploads} PDFs uploaded successfully.`
          );
        } else if (successfulUploads > 0 && failedUploads > 0) {
          showNotification(
            "error",
            "Partially uploaded",
            `${successfulUploads} uploaded successfully; ${failedUploads} failed.`
          );
        } else {
          showNotification(
            "error",
            "Upload failed",
            "Unable to upload your PDFs. Please try again."
          );
        }
      } finally {
        setUploading(false);
        setUploadProgress("");
      }
    },
    [userId, fetchNotes, showNotification]
  );

  // =====================================
  // DROPZONE
  // =====================================

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open,
  } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024,
    disabled: uploading,
    noClick: true,
  });

  // =====================================
  // OPEN PDF
  // =====================================

  const openPDF = (filePath) => {
    if (!filePath) {
      showNotification(
        "error",
        "File unavailable",
        "The PDF file path could not be found."
      );

      return;
    }

    const pdfUrl = filePath.startsWith("http")
      ? filePath
      : `${API_URL}${filePath.startsWith("/") ? "" : "/"}${filePath}`;

    window.open(
      pdfUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =====================================
  // OPEN DELETE MODAL
  // =====================================

  const openDeleteModal = (id) => {
    setSelectedNoteId(id);
    setShowDeleteModal(true);
  };

  // =====================================
  // CLOSE DELETE MODAL
  // =====================================

  const closeDeleteModal = () => {
    if (deleting) return;

    setShowDeleteModal(false);
    setSelectedNoteId(null);
  };

  // =====================================
  // CONFIRM DELETE NOTE
  // =====================================

  const confirmDeleteNote = async () => {
    if (!selectedNoteId || deleting) return;

    if (!userId) {
      showNotification(
        "error",
        "Login required",
        "Please log in again to delete notes."
      );

      return;
    }

    try {
      setDeleting(true);

      await axios.delete(
        `${API_URL}/delete-note/${selectedNoteId}`,
        {
          data: {
            userId,
          },
        }
      );

      // Remove deleted note from UI
      setNotes((prevNotes) =>
        prevNotes.filter(
          (note) => note._id !== selectedNoteId
        )
      );

      setShowDeleteModal(false);
      setSelectedNoteId(null);

      showNotification(
        "success",
        "Note deleted",
        "Your note has been deleted successfully."
      );
    } catch (err) {
      console.error("Error deleting note:", err);

      showNotification(
        "error",
        "Unable to delete note",
        err.response?.data?.message ||
          "Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  // =====================================
  // LOADING UI
  // =====================================

  if (loading) {
    return (
      <>
        <Navbar />
        <BackButton />

        <div className="dashboard">
          <div className="notes-loading">
            <div className="notes-spinner" />
            <p>Loading your notes...</p>
          </div>
        </div>
      </>
    );
  }

  // =====================================
  // MAIN UI
  // =====================================

  return (
    <>
      <Navbar />
      <BackButton />

      {/* PREMIUM NOTIFICATION */}

      {notification.show && (
        <div
          className={`notes-toast ${notification.type}`}
          role="status"
          aria-live="polite"
        >
          <div className="notes-toast-icon">
            {notification.type === "success" ? "✓" : "!"}
          </div>

          <div className="notes-toast-content">
            <h3>{notification.title}</h3>
            <p>{notification.message}</p>
          </div>

          <button
            type="button"
            className="notes-toast-close"
            onClick={closeNotification}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      <div className="dashboard">
        {/* DASHBOARD TITLE */}

        <h1 className="dashboard-title">
          My Notes 📘
        </h1>

        {/* PDF UPLOAD BOX */}

        <div
          {...getRootProps()}
          className={`upload-box ${
            isDragActive ? "drag-active" : ""
          } ${uploading ? "uploading" : ""}`}
          aria-label="PDF upload area"
        >
          <input {...getInputProps()} />

          {uploading ? (
            <>
              <div className="notes-spinner" />

              <p className="upload-status">
                {uploadProgress || "Uploading your PDFs..."}
              </p>
            </>
          ) : isDragActive ? (
            <>
              <div className="upload-icon">📂</div>
              <p>Drop your PDF files here...</p>
            </>
          ) : (
            <>
              <div className="upload-icon">📄</div>

              <h3>Upload your study notes</h3>

              <p>
                Drag and drop PDF files here, or choose files
                from your device.
              </p>

              <button
                type="button"
                className="open-btn"
                onClick={open}
              >
                + Choose PDF Files
              </button>

              <small>PDF files only · Maximum 10 MB per file</small>
            </>
          )}
        </div>

        {/* NOTES COUNT */}

        <div className="notes-section-header">
          <h2>Your Documents</h2>

          <span className="notes-count">
            {notes.length} {notes.length === 1 ? "file" : "files"}
          </span>
        </div>

        {/* NOTES GRID */}

        <div className="dashboard-grid">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div
                className="dashboard-card"
                key={note._id}
              >
                <div className="note-file-icon">
                  📄
                </div>

                <h2 title={note.title}>
                  {note.title}
                </h2>

                <p>
                  {Number(note.size || 0).toFixed(2)} MB
                </p>

                <div className="btn-group">
                  <button
                    type="button"
                    className="open-btn"
                    onClick={() => openPDF(note.file)}
                  >
                    Open PDF
                  </button>

                  <button
                    type="button"
                    className="delete-btns"
                    onClick={() => openDeleteModal(note._id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="notes-empty-state">
              <div className="empty-notes-icon">📂</div>

              <h3>No notes yet</h3>
            </div>
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
            {/* CLOSE BUTTON */}

            <button
              type="button"
              className="delete-modal-close"
              onClick={closeDeleteModal}
              disabled={deleting}
              aria-label="Close confirmation"
            >
              ×
            </button>

            {/* WARNING ICON */}

            <div className="delete-modal-icon">
              <span>!</span>
            </div>

            {/* HEADING */}

            <h2 id="delete-modal-title">
              Delete this note?
            </h2>

            {/* DESCRIPTION */}

            <p id="delete-modal-description">
              Are you sure you want to delete this note?

              <br />

              <span className="delete-warning">
                This action cannot be undone.
              </span>
            </p>

            {/* ACTION BUTTONS */}

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

            {/* FOOTER */}

            <div className="delete-modal-footer">
              <span className="delete-footer-dot" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}