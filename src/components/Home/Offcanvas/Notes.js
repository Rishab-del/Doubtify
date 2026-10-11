import React, { useState, useEffect, useCallback } from "react";
import "./Notes.css";
import BackButton from "./BackButton";
import Navbar from "../Navbar";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const API_URL = "https://doubtify-0q6d.onrender.com";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

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

      return storedUser?.id || storedUser?._id || null;
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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  // =====================================
  // NOTIFICATIONS
  // =====================================

  const showNotification = useCallback((type, title, message) => {
    setNotification({
      show: true,
      type,
      title,
      message,
    });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification((prev) => ({
      ...prev,
      show: false,
    }));
  }, []);

  useEffect(() => {
    if (!notification.show) return;

    const timer = setTimeout(() => {
      setNotification((prev) => ({
        ...prev,
        show: false,
      }));
    }, 4000);

    return () => clearTimeout(timer);
  }, [notification]);

  // =====================================
  // FETCH NOTES
  // =====================================

  const fetchNotes = useCallback(async () => {
    if (!userId) {
      setNotes([]);
      setLoading(false);
      return false;
    }

    try {
      const response = await axios.get(
        `${API_URL}/notes/${encodeURIComponent(userId)}`,
        {
          timeout: 30000,
        }
      );

      const data = response.data;

      // Support array and common object response formats.
      const fetchedNotes = Array.isArray(data)
        ? data
        : Array.isArray(data?.notes)
        ? data.notes
        : [];

      setNotes(fetchedNotes);

      return true;
    } catch (err) {
      console.error("Error fetching notes:", {
        status: err.response?.status,
        response: err.response?.data,
        message: err.message,
      });

      showNotification(
        "error",
        "Unable to load notes",
        getErrorMessage(err)
      );

      return false;
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

      // -------------------------------------
      // Handle rejected files
      // -------------------------------------

      if (rejectedFiles?.length > 0) {
        const oversizedFiles = rejectedFiles.filter((file) =>
          file.errors.some(
            (error) => error.code === "file-too-large"
          )
        );

        const invalidFiles = rejectedFiles.filter((file) =>
          file.errors.some(
            (error) => error.code === "file-invalid-type"
          )
        );

        const otherRejected = rejectedFiles.filter(
          (file) =>
            !file.errors.some(
              (error) =>
                error.code === "file-too-large" ||
                error.code === "file-invalid-type"
            )
        );

        const messages = [];

        if (oversizedFiles.length > 0) {
          messages.push(
            `${oversizedFiles.length} file(s) exceed the 10 MB limit.`
          );
        }

        if (invalidFiles.length > 0) {
          messages.push(
            `${invalidFiles.length} file(s) are not valid PDFs.`
          );
        }

        if (otherRejected.length > 0) {
          messages.push(
            `${otherRejected.length} file(s) could not be accepted.`
          );
        }

        showNotification(
          "error",
          "File upload warning",
          messages.join(" ") || "Please select valid PDF files under 10 MB."
        );
      }

      // No valid files
      if (!acceptedFiles || acceptedFiles.length === 0) {
        return;
      }

      setUploading(true);

      let successfulUploads = 0;
      const failedFiles = [];

      try {
        // -------------------------------------
        // Upload files one by one
        // -------------------------------------

        for (let i = 0; i < acceptedFiles.length; i++) {
          const file = acceptedFiles[i];

          setUploadProgress(
            `Uploading ${i + 1} of ${acceptedFiles.length}: ${file.name}`
          );

          try {
            // Extra client-side size check
            if (file.size > MAX_FILE_SIZE) {
              throw new Error("PDF size must not exceed 10 MB.");
            }

            const formData = new FormData();

            // Must match backend upload.single("file")
            formData.append("file", file);

            // Must match backend req.body.userId
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

            // Check explicit server failure.
            if (response.data?.success === false) {
              throw new Error(
                response.data?.message ||
                  response.data?.error ||
                  "The server could not upload this PDF."
              );
            }

            successfulUploads++;
          } catch (err) {
            console.error(`Error uploading ${file.name}:`, {
              status: err.response?.status,
              response: err.response?.data,
              message: err.message,
            });

            failedFiles.push({
              name: file.name,
              message: getErrorMessage(err),
            });
          }
        }

        // -------------------------------------
        // Refresh notes after uploads
        // -------------------------------------

        if (successfulUploads > 0) {
          await fetchNotes();
        }

        // -------------------------------------
        // Show upload result
        // -------------------------------------

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
        } else if (
          successfulUploads > 0 &&
          failedFiles.length > 0
        ) {
          showNotification(
            "error",
            "Partially uploaded",
            `${successfulUploads} uploaded successfully; ${failedFiles.length} failed. ${failedFiles[0].message}`
          );
        } else if (failedFiles.length > 0) {
          showNotification(
            "error",
            "Upload failed",
            failedFiles[0].message ||
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
    maxSize: MAX_FILE_SIZE,
    disabled: uploading,
    noClick: true,
  });

  // =====================================
  // OPEN PDF
  // =====================================

  const openPDF = useCallback(
    (filePath) => {
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
        : `${API_URL}${filePath.startsWith("/") ? "" : "/"}${filePath}`;

      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    },
    [showNotification]
  );

  // =====================================
  // DELETE MODAL
  // =====================================

  const openDeleteModal = (id) => {
    setSelectedNoteId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setShowDeleteModal(false);
    setSelectedNoteId(null);
  };

  // =====================================
  // DELETE NOTE
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
          data: { userId },
          timeout: 30000,
        }
      );

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

      {/* NOTIFICATIONS */}

      {notification.show && (
        <div
          className={`notes-toast ${notification.type}`}
          role="alert"
          aria-live="assertive"
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
        <h1 className="dashboard-title">My Notes 📘</h1>

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

              <small>
                PDF files only · Maximum 10 MB per file
              </small>
            </>
          )}
        </div>

        {/* NOTES HEADER */}

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
              <div className="dashboard-card" key={note._id}>
                <div className="note-file-icon">📄</div>

                <h2 title={note.title}>{note.title}</h2>

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

      {/* DELETE CONFIRMATION MODAL */}

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
            <button
              type="button"
              className="delete-modal-close"
              onClick={closeDeleteModal}
              disabled={deleting}
              aria-label="Close confirmation"
            >
              ×
            </button>

            <div className="delete-modal-icon">
              <span>!</span>
            </div>

            <h2 id="delete-modal-title">
              Delete this note?
            </h2>

            <p id="delete-modal-description">
              Are you sure you want to delete this note?
              <br />
              <span className="delete-warning">
                This action cannot be undone.
              </span>
            </p>

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

            <div className="delete-modal-footer">
              <span className="delete-footer-dot" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}