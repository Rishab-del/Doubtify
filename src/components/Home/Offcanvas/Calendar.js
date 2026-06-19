import React, { useState } from "react";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function Calendar() {
  const [date, setDate] = useState(new Date());

  return (
    <div style={{ padding: "20px" }}>
      <h2>📅 Study Calendar</h2>

      <ReactCalendar
        onChange={setDate}
        value={date}
      />

      <h3>
        Selected Date: {date.toDateString()}
      </h3>
    </div>
  );
}