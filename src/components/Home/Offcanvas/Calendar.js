import React, { useState, useEffect } from "react";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import "./Calendar.css";

import Navbar from "../Navbar";
import BackButton from "./BackButton";

export default function Calendar() {
  const [date, setDate] = useState(new Date());

  const [events, setEvents] = useState([]);

  const [showForm, setShowForm] = useState(false);

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
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(
        `https://doubtify-0q6d.onrender.com/events/${userId}`
      );

      const data = await res.json();

      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    }
  };

  /* =====================
     ADD EVENT
  ===================== */

  const addEvent = async () => {
    if (!eventData.title || !eventData.date) {
      alert("Please fill all fields");
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

      if (data.success) {
        fetchEvents();

        setShowForm(false);

        setEventData({
          title: "",
          description: "",
          date: "",
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  /* =====================
     DELETE EVENT
  ===================== */

  const deleteEvent = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this event?"
    );

    if (!confirmDelete) return;

    try {
      await fetch(
        `https://doubtify-0q6d.onrender.com/event/${id}`,
        {
          method: "DELETE",
        }
      );

      fetchEvents();
    } catch (err) {
      console.log(err);
    }
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
              onChange={setDate}
              value={date}
            />

            <div className="selected-date">
              Selected Date:
              {" "}
              {date.toDateString()}
            </div>
          </div>

          {/* EVENTS */}

          <div className="events-sidebar">

            <h3>📌 Events</h3>

            <button
              className="add-event-btn"
              onClick={() =>
                setShowForm(!showForm)
              }
            >
              + Add Event
            </button>

            {/* FORM */}

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

                <button
                  className="save-event-btn"
                  onClick={addEvent}
                >
                  Save Event
                </button>
              </div>
            )}

            {/* EVENTS LIST */}

            {events.length === 0 ? (
              <div className="no-events">
                <div>
                  <h4>
                    📅 No Active Events
                  </h4>

                  <span>
                    Create an event to get
                    started.
                  </span>
                </div>
              </div>
            ) : (
              <div className="events-list">

                {events.map((event) => (
                  <div
                    key={event._id}
                    className="event-card"
                  >
                    <div className="event-title">
                      {event.title}
                    </div>

                    <div className="event-date">
                      {new Date(
                        event.date
                      ).toDateString()}
                    </div>

                    {event.description && (
                      <div
                        className="event-desc"
                      >
                        {
                          event.description
                        }
                      </div>
                    )}

                    <button
                      className="delete-event-btn"
                      onClick={() =>
                        deleteEvent(
                          event._id
                        )
                      }
                    >
                      🗑 Delete
                    </button>
                  </div>
                ))}

              </div>
            )}

          </div>

        </div>
      </div>
    </>
  );
}