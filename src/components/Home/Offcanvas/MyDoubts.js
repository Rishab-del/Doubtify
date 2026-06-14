import React, { useState } from "react";
import "./MyDoubts.css";
import BackButton from "./BackButton";
import Navbar from "../Navbar";

export default function MyDoubts() {

  const [doubts] = useState([
    { id: 1, question: "What is React?", status: "Pending" },
    { id: 2, question: "Explain closures in JS", status: "Pending" },
    { id: 3, question: "What is useState hook?", status: "Pending" },
  ]);

  return (
    <>
      <Navbar />
      <BackButton />

      <div className="doubts-page">

        <div className="doubts-container">

          <h1>My Doubts 🤔</h1>

          <div className="doubts-list">

            {doubts.map(doubt => (
              <div className="doubt-card" key={doubt.id}>

                <h3>{doubt.question}</h3>

                <span className={
                  doubt.status === "Solved"
                    ? "status solved"
                    : "status pending"
                }>
                  {doubt.status}
                </span>

              </div>
            ))}

          </div>

        </div>
      </div>
    </>
  );
}