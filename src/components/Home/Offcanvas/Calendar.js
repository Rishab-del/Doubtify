import React, { useState } from "react";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import "./Calendar.css";

import Navbar from "../Navbar";
import BackButton from "./BackButton";

export default function Calendar() {
  const [date, setDate] = useState(new Date());

  const [events] = useState([]);

  return (
    <>
      <Navbar />
      <BackButton />

      <div className="calendar-page">
        <div className="calendar-layout">

          {/* Calendar */}
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

          {/* Events Sidebar */}
          <div className="events-sidebar">
            <h3>📌 Events</h3>

            <button className="add-event-btn">
              + Add Event
            </button>

            {events.length === 0 ? (
              <div className="no-events">
                <div>
                  <h4>📅 No Active Events</h4>
                  <span>Create an event to get started.</span>
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
                      {event.date}
                    </div>
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