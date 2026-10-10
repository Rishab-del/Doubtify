import React, { useState, useEffect } from "react";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import "./Calendar.css";

import Navbar from "../Navbar";
import BackButton from "./BackButton";

import {
  FaTrash,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";

export default function Calendar() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState([]);

  // Custom delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
  });

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userId = user?.id || user?._id;

  /* =====================
     FETCH EVENTS
  ===================== */

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (!userId) return;

        const res = await fetch(
          `https://doubtify-0q6d.onrender.com/events/${userId}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await res.json();

        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };

    fetchEvents();
  }, [userId]);

  /* =====================
     ADD EVENT
  ===================== */

  const addEvent = async () => {
    if (!eventData.title.trim() || !eventData.date) {
      alert("Please enter an event title and date.");
      return;
    }

    if (!userId) {
      alert("Please login to add an event.");
      return;
    }

    try {
      const res = await fetch(
        "https://doubtify-0q6d.onrender.com/add-event",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...eventData,
            userId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to add event");
      }

      setEvents((prev) => [data.event, ...prev]);
      setShowForm(false);

      setEventData({
        title: "",
        description: "",
        date: "",
      });
    } catch (err) {
      console.error("Error adding event:", err);
      alert(err.message || "Unable to add event.");
    }
  };

  /* =====================
     OPEN DELETE MODAL
  ===================== */

  const openDeleteModal = (event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  /* =====================
     CLOSE DELETE MODAL
  ===================== */

  const closeDeleteModal = () => {
    if (deleting) return;

    setShowDeleteModal(false);
    setEventToDelete(null);
  };

  /* =====================
     CONFIRM DELETE EVENT
  ===================== */

  const deleteEvent = async () => {
    if (!eventToDelete || deleting) return;

    const id = eventToDelete._id;

    try {
      setDeleting(true);

      const res = await fetch(
        `https://doubtify-0q6d.onrender.com/event/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete event");
      }

      // Remove event only after successful server response
      setEvents((prev) =>
        prev.filter((event) => event._id !== id)
      );

      // Also remove it from the selected-date popup, if present
      setSelectedEvent((prev) =>
        prev.filter((event) => event._id !== id)
      );

      setShowDeleteModal(false);
      setEventToDelete(null);
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Unable to delete event. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  /* =====================
     SELECT CALENDAR DATE
  ===================== */

  const handleDateChange = (value) => {
    setDate(value);

    const foundEvents = events.filter(
      (event) =>
        new Date(event.date).toDateString() ===
        value.toDateString()
    );

    setSelectedEvent(foundEvents);
  };

  return (
    <>
      <Navbar />
      <BackButton />

      <div className="calendar-page">
        <div className="calendar-layout">

          {/* CALENDAR */}

          <div className="calendar-card">
            <h1>📅 Study Calendar</h1>

            <ReactCalendar
              value={date}
              onChange={handleDateChange}
              tileClassName={({ date: tileDate }) => {
                const hasEvent = events.some(
                  (event) =>
                    new Date(event.date).toDateString() ===
                    tileDate.toDateString()
                );

                return hasEvent ? "event-date-tile" : null;
              }}
            />

            <div className="selected-date">
              Selected Date: {date.toDateString()}
            </div>
          </div>

          {/* EVENTS SIDEBAR */}

          <div className="events-sidebar">
            <h3>📌 Events</h3>

            <button
              type="button"
              className="add-event-btn"
              onClick={() => setShowForm(!showForm)}
            >
              + Add Event
            </button>

            {/* ADD EVENT FORM */}

            {showForm && (
              <div className="event-form">
                <input
                  type="text"
                  placeholder="Event Title"
                  value={eventData.title}
                  onChange={(e) =>
                    setEventData({
                      ...eventData,
                      title: e.target.value,
                    })
                  }
                />

                <textarea
                  placeholder="Description"
                  value={eventData.description}
                  onChange={(e) =>
                    setEventData({
                      ...eventData,
                      description: e.target.value,
                    })
                  }
                />

                <input
                  type="date"
                  value={eventData.date}
                  onChange={(e) =>
                    setEventData({
                      ...eventData,
                      date: e.target.value,
                    })
                  }
                />

                <div className="event-form-buttons">
                  <button
                    type="button"
                    className="save-event-btn"
                    onClick={addEvent}
                  >
                    Save Event
                  </button>

                  <button
                    type="button"
                    className="cancel-event-btn"
                    onClick={() => {
                      setShowForm(false);

                      setEventData({
                        title: "",
                        description: "",
                        date: "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* EVENTS LIST */}

            {events.length === 0 ? (
              <div className="no-events">
                <h4>📅 No Active Events</h4>
                <span>Create an event to get started.</span>
              </div>
            ) : (
              <div className="events-list">
                {events.map((event) => (
                  <div key={event._id} className="event-card">
                    <div className="event-title">
                      {event.title}
                    </div>

                    <div className="event-date">
                      {new Date(event.date).toDateString()}
                    </div>

                    {event.description && (
                      <div className="event-desc">
                        {event.description}
                      </div>
                    )}

                    <button
                      type="button"
                      className="delete-event-btn"
                      onClick={() => openDeleteModal(event)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SELECTED DATE EVENTS POPUP */}

        {selectedEvent.length > 0 && (
          <div
            className="event-popup-overlay"
            onClick={() => setSelectedEvent([])}
          >
            <div
              className="event-popup"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>📌 Events</h2>

              {selectedEvent.map((event) => (
                <div key={event._id} className="popup-event">
                  <h3>{event.title}</h3>

                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(event.date).toDateString()}
                  </p>

                  {event.description && (
                    <p>{event.description}</p>
                  )}

                  <hr />
                </div>
              ))}

              <button
                type="button"
                onClick={() => setSelectedEvent([])}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* CUSTOM DELETE CONFIRMATION MODAL */}

        {showDeleteModal && eventToDelete && (
          <div
            className="delete-modal-overlay"
            onClick={closeDeleteModal}
          >
            <div
              className="delete-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              {/* CLOSE BUTTON */}

              <button
                type="button"
                className="delete-modal-close"
                onClick={closeDeleteModal}
                disabled={deleting}
                aria-label="Close dialog"
              >
                <FaTimes />
              </button>

              {/* WARNING ICON */}

              <div className="delete-modal-icon">
                <FaExclamationTriangle />
              </div>

              {/* MODAL CONTENT */}

              <h2 id="delete-modal-title">
                Delete this event?
              </h2>

              <p className="delete-modal-message">
                Are you sure you want to delete{" "}
                <strong>{eventToDelete.title}</strong>?
                <br />
                This action cannot be undone.
              </p>

              {/* MODAL ACTIONS */}

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
                  onClick={deleteEvent}
                  disabled={deleting}
                >
                  <FaTrash />
                  {deleting ? "Deleting..." : "Delete Event"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}