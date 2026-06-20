import React, { useState } from "react";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import "./Calendar.css";

import Navbar from "../Navbar";
import BackButton from "./BackButton";

export default function Calendar() {
  const [date, setDate] = useState(new Date());

  const [events, setEvents] = useState([]);

  return (
    <>
      <Navbar />
      <BackButton />

      <div className="calendar-layout">
        
        {/* LEFT */}
        <div className="calendar-card">
          <h1>📅 Study Calendar</h1>

          <ReactCalendar
            onChange={setDate}
            value={date}
          />

          <div className="selected-date">
            Selected Date: {date.toDateString()}
          </div>
        </div>

        {/* RIGHT */}
        <div className="events-card">
          <div className="events-header">
            <h2>📌 Active Events</h2>

            <button className="add-event-btn">
              + Add Event
            </button>
          </div>

          {events.length === 0 ? (
            <div className="no-events">
              <h3>📅 No Active Events</h3>
              <p>Create an event to get started.</p>
            </div>
          ) : (
            <div className="events-list">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="event-item"
                >
                  <h4>{event.title}</h4>

                  <p>{event.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}