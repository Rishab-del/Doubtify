import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./signup.css";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",

    exam: "",
    className: "",
    city: "",

    phone: "",
    college: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const {
      name,
      email,
      password,
      confirmPassword,
      exam,
      className,
      city,
      phone,
      college,
    } = form;

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !exam ||
      !className ||
      !city
    ) {
      toast.error("⚠️ Fill all required fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error(
        "❌ Passwords do not match"
      );
      return;
    }

    try {
      const res = await fetch(
        "https://doubtify-0q6d.onrender.com/signup",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            password,

            exam,
            className,
            city,

            phone,
            college,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success(
          "Signup Successful 🎉"
        );

        navigate("/login");
      } else {
        toast.error(
          data.message ||
            "Signup Failed"
        );
      }
    } catch (err) {
      console.log(err);

      toast.error("Server Error ❌");
    }
  };

  return (
    <div className="login-page">
      <h1>
        Signup to Doubtify 🚀
      </h1>

      <form
        className="login-form"
        onSubmit={handleSignup}
      >
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={
            form.confirmPassword
          }
          onChange={handleChange}
        />

        <input
          type="text"
          name="exam"
          placeholder="Exam (JEE / NEET / UPSC)"
          value={form.exam}
          onChange={handleChange}
        />

        <input
          type="text"
          name="className"
          placeholder="Class (11 / 12 / College)"
          value={form.className}
          onChange={handleChange}
        />

        <input
          type="text"
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
        />

        <input
          type="text"
          name="college"
          placeholder="School / College"
          value={form.college}
          onChange={handleChange}
        />

        <button type="submit">
          Signup 🚀
        </button>
      </form>
    </div>
  );
}