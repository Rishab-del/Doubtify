import React, { useState, useEffect } from "react";
import "./MyDoubts.css";

import BackButton from "./BackButton";
import Navbar from "../Navbar";

export default function MyDoubts() {
  const [doubts, setDoubts] = useState([]);
  const [question, setQuestion] = useState("");

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDoubtId, setSelectedDoubtId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userId = user?.id || user?._id;

  /* =====================
     FETCH DOUBTS
  ===================== */

  useEffect(() => {
    const fetchDoubts = async () => {
      try {
        if (!userId) return;

        const res = await fetch(
          `https://doubtify-0q6d.onrender.com/doubts/${userId}`
        );

        const data = await res.json();

        setDoubts(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error("Fetch Error:", err);
      }
    };

    fetchDoubts();
  }, [userId]);

  /* =====================
     ADD DOUBT
  ===================== */

  const addDoubt = async () => {
    if (!question.trim()) {
      alert("Enter a doubt first");
      return;
    }

    if (!userId) {
      alert("Please login first");
      return;
    }

    try {
      const res = await fetch(
        "https://doubtify-0q6d.onrender.com/add-doubt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            question: question.trim(),
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success && data.doubt) {
        setDoubts((prev) => [
          data.doubt,
          ...prev,
        ]);

        setQuestion("");
      } else {
        alert(data.message || "Unable to save doubt");
      }
    } catch (err) {
      console.error("Add Error:", err);
      alert("Unable to save doubt. Please try again.");
    }
  };

  /* =====================
     OPEN DELETE MODAL
  ===================== */

  const openDeleteModal = (id) => {
    setSelectedDoubtId(id);
    setShowDeleteModal(true);
  };

  /* =====================
     CLOSE DELETE MODAL
  ===================== */

  const closeDeleteModal = () => {
    if (deleting) return;

    setShowDeleteModal(false);
    setSelectedDoubtId(null);
  };

  /* =====================
     CONFIRM DELETE DOUBT
  ===================== */

  const confirmDeleteDoubt = async () => {
    if (!selectedDoubtId || deleting) return;

    try {
      setDeleting(true);

      const res = await fetch(
        `https://doubtify-0q6d.onrender.com/doubt/${selectedDoubtId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete doubt");
      }

      // Remove only after successful API response
      setDoubts((prev) =>
        prev.filter(
          (doubt) => doubt._id !== selectedDoubtId
        )
      );

      setShowDeleteModal(false);
      setSelectedDoubtId(null);
    } catch (err) {
      console.error("Delete Error:", err);

      alert(
        "Unable to delete this doubt. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  /* =====================
     RENDER UI
  ===================== */

  return (
    <>
      <Navbar />
      <BackButton />

      <div className="doubts-page">
        <div className="doubts-container">

          <h1>My Doubts 🤔</h1>

          {/* ADD DOUBT */}

          <div className="doubt-input-box">
            <input
              type="text"
              placeholder="Enter your doubt..."
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addDoubt();
                }
              }}
            />

            <button
              type="button"
              onClick={addDoubt}
            >
              ➕ Save as Doubt
            </button>
          </div>

          {/* DOUBTS LIST */}

          <div className="doubts-list">
            {doubts.length === 0 ? (
              <div className="empty">
                No doubts added yet 🤔
              </div>
            ) : (
              doubts.map((doubt) => (
                <div
                  className="doubt-card"
                  key={doubt._id}
                >
                  <h3>{doubt.question}</h3>

                  <span
                    className={
                      doubt.status === "Solved"
                        ? "status solved"
                        : "status pending"
                    }
                  >
                    {doubt.status || "Pending"}
                  </span>

                  <button
                    type="button"
                    className="delete-doubt-btn"
                    onClick={() =>
                      openDeleteModal(doubt._id)
                    }
                  >
                    🗑 Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* =========================
          PREMIUM DELETE MODAL
      ========================= */}

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

            {/* TITLE */}

            <h2 id="delete-modal-title">
              Delete this doubt?
            </h2>

            {/* DESCRIPTION */}

            <p id="delete-modal-description">
              Are you sure you want to delete this doubt?
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
                onClick={confirmDeleteDoubt}
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
                    Delete Doubt
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