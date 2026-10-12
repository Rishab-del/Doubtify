import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import "./Discussion.css";

import Navbar from "../Home/Navbar";
import BackButton from "../Home/Offcanvas/BackButton";

import io from "socket.io-client";

const API_URL = "https://doubtify-0q6d.onrender.com";

// =====================================
// SOCKET CONNECTION
// =====================================

const socket = io(API_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  timeout: 20000,
});

export default function Discussion() {
  const [doubts, setDoubts] = useState([]);
  const [input, setInput] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [connectionStatus, setConnectionStatus] =
    useState(socket.connected ? "connected" : "connecting");

  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // =====================================
  // USER DETAILS
  // =====================================

  const storedUser = (() => {
  try {
    const rawUser = localStorage.getItem("user");

    if (
      !rawUser ||
      rawUser === "undefined" ||
      rawUser === "null"
    ) {
      return {};
    }

    const parsedUser = JSON.parse(rawUser);

    if (
      !parsedUser ||
      typeof parsedUser !== "object" ||
      Array.isArray(parsedUser)
    ) {
      return {};
    }

    return parsedUser;
  } catch (error) {
    console.error("Error reading user in Discussion:", error);
    return {};
  }
})();

const username = storedUser?.name || "Anonymous";

  const username = storedUser?.name || "Anonymous";

  const avatar =
    storedUser?.profilePic ||
    storedUser?.avatar ||
    "https://i.pravatar.cc/150?img=3";

  // =====================================
  // SOCKET CONNECTION AND CHAT EVENTS
  // =====================================

  useEffect(() => {
    const handleConnect = () => {
      console.log(
        "Discussion socket connected:",
        socket.id
      );

      setConnectionStatus("connected");
    };

    const handleDisconnect = (reason) => {
      console.log(
        "Discussion socket disconnected:",
        reason
      );

      setConnectionStatus("disconnected");
    };

    const handleConnectError = (error) => {
      console.error(
        "Discussion socket error:",
        error.message
      );

      setConnectionStatus("disconnected");
    };

    const handleLoadMessages = (messages) => {
      setDoubts(
        Array.isArray(messages) ? messages : []
      );
    };

    const handleReceiveMessage = (message) => {
      setDoubts((previous) => {
        const alreadyExists = previous.some(
          (item) => item._id === message._id
        );

        if (alreadyExists) {
          return previous;
        }

        return [...previous, message];
      });
    };

    const handleTyping = (data) => {
      if (!data?.user || data.user === username) {
        return;
      }

      setTypingUser(data.user);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setTypingUser("");
      }, 1500);
    };

    const handleReactionUpdated = (updatedMessage) => {
      setDoubts((previous) =>
        previous.map((message) =>
          message._id === updatedMessage._id
            ? updatedMessage
            : message
        )
      );
    };

    const handleMessageDeleted = (id) => {
      setDoubts((previous) =>
        previous.filter(
          (message) => message._id !== id
        )
      );
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    socket.on("load_messages", handleLoadMessages);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("typing", handleTyping);
    socket.on(
      "reaction_updated",
      handleReactionUpdated
    );
    socket.on(
      "message_deleted",
      handleMessageDeleted
    );

    if (!socket.connected) {
      socket.connect();
    } else {
      setConnectionStatus("connected");
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);

      socket.off("load_messages", handleLoadMessages);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("typing", handleTyping);
      socket.off(
        "reaction_updated",
        handleReactionUpdated
      );
      socket.off(
        "message_deleted",
        handleMessageDeleted
      );

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [username]);

  // =====================================
  // AUTO SCROLL
  // =====================================

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [doubts, typingUser]);

  // =====================================
  // SEND MESSAGE
  // =====================================

  const handlePost = () => {
    const text = input.trim();

    if (!text) {
      return;
    }

    if (!socket.connected) {
      setConnectionStatus("disconnected");
      return;
    }

    socket.emit("send_message", {
      text,
      user: username,
      avatar,
      reactions: [],
      seenBy: [],
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    setInput("");
    setTypingUser("");
  };

  // =====================================
  // TYPING
  // =====================================

  const handleTypingInput = (event) => {
    setInput(event.target.value);

    if (socket.connected) {
      socket.emit("typing", {
        user: username,
      });
    }
  };

  // =====================================
  // REACTION
  // =====================================

  const addReaction = (messageId, emoji) => {
    if (!socket.connected) {
      return;
    }

    socket.emit("add_reaction", {
      messageId,
      emoji,
      user: username,
    });
  };

  // =====================================
  // DELETE MESSAGE
  // =====================================

  const deleteMessage = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this message?"
    );

    if (!confirmDelete || !socket.connected) {
      return;
    }

    socket.emit("delete_message", id);
  };

  // =====================================
  // UI
  // =====================================

  return (
    <div className="discussion-container">
      <BackButton />
      <Navbar />

      <h2 className="heading">
        💬 Discussion Panel
      </h2>

      {/* CONNECTION STATUS — ORIGINAL POSITION */}

      <div
        className={`discussion-connection ${connectionStatus}`}
        role="status"
      >
        {connectionStatus === "connected"
          ? "🟢 Connected to discussion"
          : connectionStatus === "connecting"
          ? "🟡 Connecting to discussion..."
          : "🔴 Disconnected. Reconnecting..."}
      </div>

      {/* CHAT BOX — NOW ABOVE INPUT */}

      <div className="doubt-list">
        {/* EMPTY STATE */}

        {doubts.length === 0 ? (
          <p className="empty">
            No discussions yet 🚀 Start the conversation!
          </p>
        ) : (
          doubts.map((message) => (
            <div
              key={message._id}
              className={`doubt-card ${
                message.user === username
                  ? "right"
                  : "left"
              }`}
            >
              <img
                src={
                  message.avatar ||
                  "https://i.pravatar.cc/150?img=3"
                }
                alt=""
                className="avatar"
                onError={(event) => {
                  event.currentTarget.onerror = null;

                  event.currentTarget.src =
                    "https://i.pravatar.cc/150?img=3";
                }}
              />

              <div className="content">
                {/* MESSAGE TEXT */}

                <p className="message">
                  {message.text}
                </p>

                {/* REACTIONS */}

                {message.user !== username && (
                  <div className="reactions">
                    <button
                      type="button"
                      onClick={() =>
                        addReaction(
                          message._id,
                          "🔥"
                        )
                      }
                      aria-label="React with fire"
                    >
                      🔥
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        addReaction(
                          message._id,
                          "❤️"
                        )
                      }
                      aria-label="React with heart"
                    >
                      ❤️
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        addReaction(
                          message._id,
                          "😂"
                        )
                      }
                      aria-label="React with laughing face"
                    >
                      😂
                    </button>
                  </div>
                )}

                {/* EXISTING REACTIONS */}

                {message.reactions?.length > 0 && (
                  <div className="reaction-display">
                    {message.reactions.map(
                      (reaction, index) => (
                        <span key={index}>
                          {reaction.emoji}
                        </span>
                      )
                    )}
                  </div>
                )}

                {/* MESSAGE DETAILS */}

                <div className="meta">
                  <span className="user">
                    {message.user || "Anonymous"}
                  </span>

                  <span className="time">
                    {message.time}
                  </span>

                  <span className="seen">
                    Seen by{" "}
                    {message.seenBy?.length || 0}
                  </span>
                </div>
              </div>

              {/* DELETE OWN MESSAGE */}

              {message.user === username && (
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() =>
                    deleteMessage(message._id)
                  }
                  aria-label="Delete message"
                  title="Delete message"
                >
                  🗑
                </button>
              )}
            </div>
          ))
        )}

        {/* TYPING INDICATOR — INSIDE CHAT AT BOTTOM */}

        {typingUser && (
          <p className="typing-text">
            {typingUser} is typing...
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT BAR — BELOW THE CHAT BOX */}

      <div className="post-box">
        <input
          type="text"
          placeholder="Ask your doubt..."
          value={input}
          onChange={handleTypingInput}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handlePost();
            }
          }}
          maxLength={2000}
          disabled={connectionStatus !== "connected"}
        />

        <button
          type="button"
          onClick={handlePost}
          disabled={
            !input.trim() ||
            connectionStatus !== "connected"
          }
        >
          Send
        </button>
      </div>
    </div>
  );
}