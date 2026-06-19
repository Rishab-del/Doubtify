import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());

  return (
    <div style={{ padding: "20px" }}>
      <h2>📅 Study Calendar</h2>

      <Calendar
        onChange={setDate}
        value={date}
      />

      <h3>
        Selected Date:
        {" "}
        {date.toDateString()}
      </h3>
    </div>
  );
}