import React from "react";
import "./Notes.css";
import BackButton from "./BackButton";


export default function Notes() {
  const notes = [
    { id: 1, title: "React Basics", desc: "Components, props, state" },
    { id: 2, title: "JavaScript Closures", desc: "Scope & closures" },
    { id: 3, title: "DSA Arrays", desc: "Important patterns" },
    { id: 4, title: "Operating system", desc: "Multithreading" },
    { id: 5, title: "DBMS", desc: "MySql" },
    { id: 6, title: "DBMS", desc: "Transactions" },
  ];

  return (
    <>
      <BackButton />

      <div className="dashboard">

        <h1 className="dashboard-title">My Notes 📘</h1>

        <div className="dashboard-grid">

          {notes.map((note) => (
            <div className="dashboard-card" key={note.id}>

              <h2>{note.title}</h2>
              <p>{note.desc}</p>

            </div>
          ))}

        </div>

      </div>
    </>
  );
}