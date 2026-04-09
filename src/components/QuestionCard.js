import React from "react";

export default function QuestionCard({ data }) {
  return (
    <div className="card">
      <h3>{data.title}</h3>
      <p>{data.desc}</p>
    </div>
  );
}