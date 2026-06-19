import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import "./Discussion.css";

import Navbar from "../Home/Navbar";
import BackButton from "../Home/Offcanvas/BackButton";

import io from "socket.io-client";

const socket = io("https://doubtify-0q6d.onrender.com");

export default function Discussion() {

  const [doubts, setDoubts] =
    useState([]);

  const [input, setInput] =
    useState("");

  const [typingUser, setTypingUser] =
    useState("");

  const bottomRef = useRef(null);

  const username = JSON.parse(
    localStorage.getItem("user")
  )?.name;

  const avatar = JSON.parse(
    localStorage.getItem("user")
  )?.avatar
    ? `https://doubtify-0q6d.onrender.com${
        JSON.parse(
          localStorage.getItem("user")
        ).avatar
      }`
    : "https://i.pravatar.cc/150?img=3";


  /* =========================
      SOCKET EVENTS
  ========================= */

  useEffect(() => {

    /* LOAD OLD MSGS */

    socket.on(
      "load_messages",

      (messages) => {

        setDoubts(messages);

      }
    );

    /* RECEIVE MESSAGE */

    socket.on(
      "receive_message",

      (message) => {

        setDoubts((prev) => {

          const exists = prev.some(
            (msg) =>
              msg._id === message._id
          );

          if (exists) return prev;

          return [...prev, message];

        });

      }
    );

    /* TYPING */

    socket.on(
      "typing",

      (data) => {

        if (data.user !== username) {

          setTypingUser(data.user);

          setTimeout(() => {
            setTypingUser("");
          }, 1500);

        }

      }
    );

    /* REACTION UPDATE */

    socket.on(
      "reaction_updated",

      (updated) => {

        setDoubts((prev) =>
          prev.map((msg) =>
            msg._id === updated._id
              ? updated
              : msg
          )
        );

      }
    );

    /* DELETE */

    socket.on(
      "message_deleted",

      (id) => {

        setDoubts((prev) =>
          prev.filter(
            (msg) => msg._id !== id
          )
        );

      }
    );

    return () => {

      socket.off(
        "load_messages"
      );

      socket.off(
        "receive_message"
      );

      socket.off("typing");

      socket.off(
        "reaction_updated"
      );

      socket.off(
        "message_deleted"
      );

    };

  }, [username]);

  /* =========================
      AUTO SCROLL
  ========================= */

  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [doubts]);

  /* =========================
      SEND MESSAGE
  ========================= */

  const handlePost = () => {

    if (!input.trim()) return;

    const newMessage = {

      text: input,

      user: username,

      avatar,

      reactions: [],

      seenBy: [],

      time:
        new Date().toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        ),

    };

    socket.emit(
      "send_message",
      newMessage
    );

    setInput("");

  };

  /* =========================
      TYPING
  ========================= */

  const handleTyping = (e) => {

    setInput(e.target.value);

    socket.emit("typing", {

      user: username,

    });

  };

  /* =========================
      REACTION
  ========================= */

  const addReaction = (
    id,
    emoji
  ) => {

    socket.emit(
      "add_reaction",

      {
        messageId: id,
        emoji,
        user: username,
      }
    );

  };

  /* =========================
      DELETE
  ========================= */

 const deleteMessage = (id) => {

  const confirmDelete =
    window.confirm(
      "Are you sure you want to delete this message?"
    );

  if (!confirmDelete) return;

  socket.emit(
    "delete_message",
    id
  );

};

  return (

    <div className="discussion-container">

      <BackButton />
      <Navbar />

      {/* HEADING */}

      <h2 className="heading">
        💬 Discussion Panel
      </h2>

      {/* INPUT */}

      <div className="post-box">

        <input
          type="text"
          placeholder="Ask your doubt..."
          value={input}
          onChange={handleTyping}
          onKeyDown={(e) =>
            e.key === "Enter" &&
            handlePost()
          }
        />

        <button onClick={handlePost}>
          Send
        </button>

      </div>

      {/* TYPING */}

      {typingUser && (

        <p className="typing-text">
          {typingUser} is typing...
        </p>

      )}

      {/* CHATS */}

      <div className="doubt-list">

        {doubts.length === 0 ? (

          <p className="empty">
            No discussions yet 🚀
          </p>

        ) : (

          doubts.map((d) => (

            <div
              key={d._id}
              className={`doubt-card ${
                d.user === username
                  ? "right"
                  : "left"
              }`}
            >

              {/* AVATAR */}

              <img
                src={d.avatar}
                alt=""
                className="avatar"
              />

              {/* CONTENT */}

              <div className="content">

                {/* MESSAGE */}

                <p className="message">
                  {d.text}
                </p>

                {/* REACTION BUTTONS */}

                {d.user !== username && (

                  <div className="reactions">

                    <button
                      onClick={() =>
                        addReaction(
                          d._id,
                          "🔥"
                        )
                      }
                    >
                      🔥
                    </button>

                    <button
                      onClick={() =>
                        addReaction(
                          d._id,
                          "❤️"
                        )
                      }
                    >
                      ❤️
                    </button>

                    <button
                      onClick={() =>
                        addReaction(
                          d._id,
                          "😂"
                        )
                      }
                    >
                      😂
                    </button>

                  </div>

                )}

                {/* SHOW REACTIONS */}

                {d.reactions?.length >
                  0 && (

                  <div className="reaction-display">

                    {d.reactions.map(
                      (r, i) => (

                        <span key={i}>
                          {r.emoji}
                        </span>

                      )
                    )}

                  </div>

                )}

                {/* META */}

                <div className="meta">

                  <span className="user">
                    {d.user}
                  </span>

                  <span className="time">
                    {d.time}
                  </span>

                  <span className="seen">
                    Seen by{" "}
                    {
                      d.seenBy?.length
                    }
                  </span>

                </div>

              </div>

              {/* DELETE */}

              {d.user === username && (

                <button
                  className="delete-btn"
                  onClick={() =>
                    deleteMessage(d._id)
                  }
                >
                  🗑
                </button>

              )}

            </div>

          ))

        )}

        <div ref={bottomRef}></div>

      </div>

    </div>

  );
}
