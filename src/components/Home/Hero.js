import React from "react";
import "./Hero.css";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  const reviews = [
    {
      name: "Aarav Sharma",
      role: "Student",
      avatar: "👨🏻‍🎓",
      review:
        "The step-by-step explanations make difficult concepts easier to understand.",
    },
    {
      name: "Priya Verma",
      role: "Learner",
      avatar: "👩🏻‍🎓",
      review:
        "I like having AI doubt solving and study notes together in one place.",
    },
    {
      name: "Rahul Mehta",
      role: "Coding Enthusiast",
      avatar: "👨🏻‍💻",
      review:
        "Doubtify helps me understand the logic behind coding solutions.",
    },
  ];

  return (
    <main className="doubtify-home">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">
            🚀 AI Powered Learning Platform
          </span>

          <h1>
            Solve Your Doubts {" "}
            <span > Instantly  </span> {" "}
            with AI
          </h1>

          <p>
            Get step-by-step solutions for Coding,
            Mathematics, Science and Aptitude questions in seconds.
          </p>

          <div className="hero-features">
            <div>🤖 AI Doubt Solver</div>
            <div>📚 Smart Notes</div>
            <div>📈 Progress Tracking</div>
            <div>👥 Community Discussions</div>
          </div>

          <div className="buttons">
            <button
              className="primary-btn"
              onClick={() => navigate("/dashboard/aichat")}
            >
              Ask AI Now 🤖
            </button>

            <button
              className="secondary-btn"
              onClick={() => navigate("/features")}
            >
              Explore Features ✨
            </button>
          </div>

          <div className="hero-stats">
            <div>
              <h3>24/7</h3>
              <span>Available</span>
            </div>

            <div>
              <h3>1000+</h3>
              <span>Doubts Solved</span>
            </div>

            <div>
              <h3>AI</h3>
              <span>Powered</span>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section className="hero-reviews">
        <div className="reviews-heading">
          <span className="hero-badge">
            💜 LEARN BETTER TOGETHER
          </span>

          <h2>
            Learning feels better <span>together.</span>
          </h2>

          <p>
            Discover how Doubtify makes learning simpler,
            smarter and more accessible.
          </p>
        </div>

        <div className="reviews-grid">
          {reviews.map((review, index) => (
            <article className="review-card" key={index}>
              <div className="review-user">
                <div className="review-avatar">
                  {review.avatar}
                </div>

                <div className="review-user-info">
                  <h3>{review.name}</h3>
                  <span>{review.role}</span>
                </div>

                <span className="review-quote">〃</span>
              </div>

              <div
                className="review-stars"
                aria-label="5 out of 5 stars"
              >
                ★★★★★
              </div>

              <p className="review-text">
                {review.review}
              </p>

              <div className="review-footer">
                <span className="review-dot"></span>
                Sample feedback
              </div>
            </article>
          ))}
        </div>

        {/* BOTTOM CTA */}
        <div className="reviews-cta">
          <p>Ready to make learning simpler?</p>

          <button
            className="primary-btn"
            onClick={() => navigate("/dashboard")}
          >
            Start Learning 🚀
          </button>
        </div>
      </section>
    </main>
  );
}