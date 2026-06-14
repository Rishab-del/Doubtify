import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./signup.css";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    exam: "",
    className: "",
    city: ""
  });
  

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const { name, email, password, confirmPassword, exam, className, city } = form;

    if (!name || !email || !password || !confirmPassword || !exam || !className || !city) {
      toast.error("⚠️ Fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("❌ Passwords do not match");
      return;
    }

    try {
      const res = await fetch("https://doubtify-0q6d.onrender.com/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password, exam, className, city })
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Signup successful");
        navigate("/");
      } else {
        toast.error(data.message);
      }

    } catch (err) {
      toast.error("Server error");
    }
  };

  return (
    <div className="login-page">
      <h1>Signup to Doubtify🚀</h1>

      <form className="login-form" onSubmit={handleSignup}>
        
        <input name="name" placeholder="Full Name" onChange={handleChange} />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} />
        
        <input name="password" type="password" placeholder="Password" onChange={handleChange} />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} />

        <input name="exam" placeholder="Exam (JEE, NEET, UPSC...)" onChange={handleChange} />
        <input name="className" placeholder="Class (11, 12...)" onChange={handleChange} />
        <input name="city" placeholder="City" onChange={handleChange} />

        <button type="submit">Signup</button>
      </form>
    </div>
  );
}