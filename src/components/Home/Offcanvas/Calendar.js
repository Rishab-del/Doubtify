import React, { useState } from "react";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Calendar.css";

export default function Calendar() {
  const [date, setDate] = useState(new Date());

  return (
    <div className="calendar-page">
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
    </div>
  );
}