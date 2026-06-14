import React, { useState,useEffect} from "react";
import "./Notes.css";
import BackButton from "./BackButton";
import Navbar from "../Navbar";
import { useDropzone } from "react-dropzone";
import axios from "axios";
export default function Notes() {
  const [notes, setNotes] = useState([]);

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
      console.log(err);
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
        const formData =new FormData();
        formData.append("file",file);

        await axios.post(
          "https://doubtify-0q6d.onrender.com/upload",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      } catch (err) {
        console.log(err);
      }
    }

    /* REFRESH NOTES */
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
   DELETE NOTE
========================= */

const deleteNote = async (id) => {

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this note?"
  );

  if (!confirmDelete) return;

  try {

    await axios.delete(
      `https://doubtify-0q6d.onrender.com/delete-note/${id}`
    );

    fetchNotes();

  } catch (err) {

    console.log(err);
  }
};

  return (
    <>
      <Navbar />
      <BackButton />

      <div className="dashboard">

        <h1 className="dashboard-title">
          My Notes 📘
        </h1>

        {/* ======================
            UPLOAD BOX
        ====================== */}

        <div
          {...getRootProps()}
          className="upload-box"
        >
          <input
            {...getInputProps()}
          />

          {isDragActive ? (

            <p>
              Drop the PDF here...
            </p>

          ) : (

            <p> + Drag / Click to Upload</p>
          )}
        </div>

        {/* ======================
            NOTES
        ====================== */}

        <div className="dashboard-grid">

          {notes.length > 0 ? (

            notes.map((note) => (

              <div
                className="dashboard-card"
                key={note._id}
              >
                <h2>
                  📄 {note.title}
                </h2>

                <p>
                  {note.size} MB
                </p>

                <div className="btn-group">

  <button
    className="open-btn"
    onClick={() =>
      window.open(
        `https://doubtify-0q6d.onrender.com${note.file}`
      )
    }
  >
    Open PDF
  </button>

  <button
    className="delete-btns"
    onClick={() =>
      deleteNote(note._id)
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
    </>
  );
}