import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./signup.css";

export default function Signup() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

const [form, setForm] = useState({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",

  exam: "",
  className: "",

  countryCode: "+91",
  phone: "",

  city: "",
  college: "",
});

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

const handleChange = (e) => {
  setForm({
    ...form,
    [e.target.name]: e.target.value,
  });
};

const nextStep = () => {
  if (step === 1) {
    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      toast.error("Fill all fields");
      return;
    }

    if (
      !passwordRegex.test(form.password)
    ) {
      toast.error(
        "Password must contain uppercase, lowercase, number and special character"
      );
      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      toast.error(
        "Passwords do not match"
      );
      return;
    }
  }

  setStep(step + 1);
};

const prevStep = () => {
  setStep(step - 1);
};

const handleSignup = async (e) => {
  e.preventDefault();

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
          ...form,

          phone:
            form.countryCode +
            form.phone,
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
      toast.error(data.message);
    }
  } catch (err) {
    console.log(err);

    toast.error(
      "Server Error ❌"
    );
  }
};
return (
  <div className="login-page">

    <h1>
      Signup to Doubtify 🚀
    </h1>

    <div className="step-indicator">
      Step {step} of 3
    </div>

    <form
      className="login-form"
      onSubmit={handleSignup}
    >

      {/* STEP 1 */}

      {step === 1 && (
        <>
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

          <small>
            Password:
            8+ chars,
            Uppercase,
            Lowercase,
            Number,
            Special Character
          </small>

          <button
            type="button"
            onClick={nextStep}
          >
            Next →
          </button>
        </>
      )}

      {/* STEP 2 */}

      {step === 2 && (
        <>
          <select
            name="exam"
            value={form.exam}
            onChange={handleChange}
          >
            <option value="">
              Select Exam
            </option>

            <option>JEE</option>
            <option>NEET</option>
            <option>UPSC</option>
            <option>GATE</option>
            <option>SSC</option>
            <option>Other</option>
          </select>

          <select
            name="className"
            value={form.className}
            onChange={handleChange}
          >
            <option value="">
              Education Level
            </option>

            <option>
              Class 9
            </option>

            <option>
              Class 10
            </option>

            <option>
              Class 11
            </option>

            <option>
              Class 12
            </option>

            <option>
              College
            </option>

            <option>
              Graduate
            </option>
          </select>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              type="button"
              onClick={prevStep}
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={nextStep}
            >
              Next →
            </button>

            <button
              type="button"
              onClick={() =>
                setStep(3)
              }
            >
              Skip
            </button>
          </div>
        </>
      )}

     {step === 3 && (
  <>
    <div className="phone-wrapper">
      <select
        name="countryCode"
        value={form.countryCode}
        onChange={handleChange}
      >
        <option value="+91">🇮🇳 +91</option>
        <option value="+1">🇺🇸 +1</option>
        <option value="+44">🇬🇧 +44</option>
        <option value="+61">🇦🇺 +61</option>
        <option value="+971">🇦🇪 +971</option>
      </select>

      <input
        type="text"
        name="phone"
        placeholder="Phone Number"
        value={form.phone}
        onChange={handleChange}
      />
    </div>

    <input
      type="text"
      name="city"
      placeholder="City"
      value={form.city}
      onChange={handleChange}
    />

    <input
      type="text"
      name="college"
      placeholder="School / College"
      value={form.college}
      onChange={handleChange}
    />

    <div
      style={{
        display: "flex",
        gap: "10px",
      }}
    >
      <button
        type="button"
        onClick={prevStep}
      >
        ← Back
      </button>

      <button type="submit">
        Signup 🚀
      </button>
    </div>
  </>
)}

    </form>
  </div>
);
}
