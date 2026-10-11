import React, { useState, useEffect, useCallback } from "react";
import "./Notes.css";
import BackButton from "./BackButton";
import Navbar from "../Navbar";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const API_URL = "https://doubtify-0q6d.onrender.com";

// =====================================
// ERROR HANDLER
// =====================================

const getErrorMessage = (err) => {
  if (err.response?.data?.message) {
    return err.response.data.message;
  }

  if (err.response?.data?.error) {
    return err.response.data.error;
  }

  if (err.response) {
    return `Server error (${err.response.status}). Please try again.`;
  }

  if (err.request) {
    return "Server se response nahi mila. Please try again.";
  }

  return err.message || "Something went wrong.";
};

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
    } catch (err) {
      console.error("Unable to read logged-in user:", err);
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
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification]);

  // =====================================
  // FETCH NOTES
  // =====================================
const fetchNotes = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Login token not found. Please log in again.");
      return;
    }

    const response = await fetch(`${API_URL}/notes`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch notes");
    }

    setNotes(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error fetching notes:", error);
  }
};

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
    async (acceptedFiles, rejectedFiles) => {
      // Check login
      if (!userId) {
        showNotification(
          "error",
          "Login required",
          "Please log in before uploading notes."
        );

        return;
      }

      // Show validation errors
      if (rejectedFiles?.length > 0) {
        const firstError = rejectedFiles[0].errors?.[0];

        let message = "Please select a valid PDF file.";

        if (firstError?.code === "file-too-large") {
          message = "PDF size must not exceed 10 MB.";
        } else if (
          firstError?.code === "file-invalid-type"
        ) {
          message = "Only PDF files are allowed.";
        }

        showNotification(
          "error",
          "Invalid file",
          rejectedFiles.length > 1
            ? `${rejectedFiles.length} file(s) rejected. ${message}`
            : message
        );
      }

      if (!acceptedFiles || acceptedFiles.length === 0) {
        return;
      }

      setUploading(true);

      let successfulUploads = 0;
      const failedFiles = [];

      try {
        for (let i = 0; i < acceptedFiles.length; i++) {
          const file = acceptedFiles[i];

          setUploadProgress(
            `Uploading ${i + 1} of ${acceptedFiles.length}: ${file.name}`
          );

          try {
            const formData = new FormData();

            // Must match upload.single("file") in Server.js
            formData.append("file", file);

            // Must match req.body.userId in Server.js
            formData.append("userId", userId);

            const response = await axios.post(
              `${API_URL}/upload`,
              formData,
              {
                timeout: 120000,

                onUploadProgress: (event) => {
                  if (event.total) {
                    const percent = Math.round(
                      (event.loaded * 100) / event.total
                    );

                    setUploadProgress(
                      `Uploading ${file.name}: ${percent}%`
                    );
                  }
                },
              }
            );

            if (
              response.data?.success === false ||
              !response.data?.note
            ) {
              throw new Error(
                response.data?.error ||
                  response.data?.message ||
                  "The server did not confirm the upload."
              );
            }

            successfulUploads++;
          } catch (err) {
            console.error(
              `Upload failed for ${file.name}:`,
              {
                status: err.response?.status,
                response: err.response?.data,
                message: err.message,
              }
            );

            failedFiles.push({
              name: file.name,
              message: getErrorMessage(err),
            });
          }
        }

        // Refresh notes after upload attempts
        await fetchNotes();

        // All successful
        if (
          successfulUploads > 0 &&
          failedFiles.length === 0
        ) {
          showNotification(
            "success",
            "Upload successful!",
            successfulUploads === 1
              ? "Your PDF has been uploaded successfully."
              : `${successfulUploads} PDFs uploaded successfully.`
          );
        }

        // Partial success
        else if (
          successfulUploads > 0 &&
          failedFiles.length > 0
        ) {
          showNotification(
            "error",
            "Partially uploaded",
            `${successfulUploads} uploaded successfully; ${failedFiles.length} failed. ${failedFiles[0].message}`
          );
        }

        // All failed
        else {
          showNotification(
            "error",
            "Upload failed",
            failedFiles[0]?.message ||
              "Unable to upload your PDFs. Please try again."
          );
        }
      } catch (err) {
        console.error("Upload process error:", err);

        showNotification(
          "error",
          "Upload failed",
          getErrorMessage(err)
        );
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

    const pdfUrl = /^https?:\/\//i.test(filePath)
      ? filePath
      : `${API_URL}${
          filePath.startsWith("/") ? "" : "/"
        }${filePath}`;

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

          timeout: 30000,
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
      console.error("Error deleting note:", {
        status: err.response?.status,
        response: err.response?.data,
        message: err.message,
      });

      showNotification(
        "error",
        "Unable to delete note",
        getErrorMessage(err)
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

      {/* NOTIFICATION */}

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
                {uploadProgress ||
                  "Uploading your PDFs..."}
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

              <p className="upload-status">
                PDF files only · Maximum 10 MB per file
              </p>
            </>
          )}
        </div>

        {/* NOTES COUNT */}

        <div className="notes-section-header">
          <h2>Your Documents</h2>

          <span className="notes-count">
            {notes.length}{" "}
            {notes.length === 1 ? "file" : "files"}
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
            <div className="notes-empty-state">
              <div className="empty-notes-icon">
                📂
              </div>

              <h3>No notes yet</h3>
            </div>
          )}
        </div>
      </div>

      {/* =================================
          DELETE CONFIRMATION MODAL
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