import React, { useState, useEffect } from "react";
import "./MyDoubts.css";

import BackButton from "./BackButton";
import Navbar from "../Navbar";

export default function MyDoubts() {
  const [doubts, setDoubts] = useState([]);
  const [question, setQuestion] = useState("");

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
        console.log("Fetch Error:", err);
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

    try {
      const res = await fetch(
        "https://doubtify-0q6d.onrender.com/add-doubt",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            userId,
            question,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setDoubts((prev) => [
          data.doubt,
          ...prev,
        ]);

        setQuestion("");
      }
    } catch (err) {
      console.log("Add Error:", err);
    }
  };

  /* =====================
     DELETE DOUBT
  ===================== */

  const deleteDoubt = async (id) => {
    const confirmDelete =
      window.confirm(
        "Delete this doubt?"
      );

    if (!confirmDelete) return;

    try {
      await fetch(
        `https://doubtify-0q6d.onrender.com/doubt/${id}`,
        {
          method: "DELETE",
        }
      );

      setDoubts((prev) =>
        prev.filter(
          (doubt) => doubt._id !== id
        )
      );
    } catch (err) {
      console.log("Delete Error:", err);
    }
  };

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
                setQuestion(
                  e.target.value
                )
              }
            />

            <button
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
                  <h3>
                    {doubt.question}
                  </h3>

                  <span
                    className={
                      doubt.status ===
                      "Solved"
                        ? "status solved"
                        : "status pending"
                    }
                  >
                    {doubt.status ||
                      "Pending"}
                  </span>

                  <button
                    className="delete-doubt-btn"
                    onClick={() =>
                      deleteDoubt(
                        doubt._id
                      )
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
    </>
  );
}