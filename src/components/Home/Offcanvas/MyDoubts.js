import React, {
  useState,
  useEffect,
} from "react";

import "./MyDoubts.css";

import BackButton from "./BackButton";
import Navbar from "../Navbar";

export default function MyDoubts() {
  const [doubts, setDoubts] =
    useState([]);

  const [question, setQuestion] =
    useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userId =
    user?.id || user?._id;

  useEffect(() => {
    fetchDoubts();
  }, [userId]);

  const fetchDoubts = async () => {
    try {
      const res = await fetch(
        `https://doubtify-0q6d.onrender.com/doubts/${userId}`
      );

      const data = await res.json();

      setDoubts(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.log(err);
    }
  };

  const addDoubt = async () => {
    if (!question.trim()) return;

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
      console.log(err);
    }
  };

  const deleteDoubt = async (id) => {
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
      console.log(err);
    }
  };

  return (
    <>
      <Navbar />
      <BackButton />

      <div className="doubts-page">
        <div className="doubts-container">

          <h1>My Doubts 🤔</h1>

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
              Add Doubt
            </button>

          </div>

          <div className="doubts-list">

            {doubts.map((doubt) => (
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
                  {doubt.status}
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
            ))}

          </div>
        </div>
      </div>
    </>
  );
}