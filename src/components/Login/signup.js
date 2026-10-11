import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./signup.css";

const API = "https://doubtify-0q6d.onrender.com";

export default function Signup() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

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

  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");

  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);

  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset email verification if email changes
    if (name === "email") {
      setEmailVerified(false);
      setEmailOtpSent(false);
      setEmailOtp("");
    }

    // Reset phone verification if phone or country code changes
    if (name === "phone" || name === "countryCode") {
      setPhoneVerified(false);
      setPhoneOtpSent(false);
      setPhoneOtp("");
    }
  };

  // Send OTP
  const sendOtp = async (type) => {
    if (loading) return;

    const isEmail = type === "email";
    const email = form.email.trim().toLowerCase();

    const phone = `${form.countryCode}${form.phone}`.replace(
      /[\s()-]/g,
      ""
    );

    if (isEmail && !email) {
      toast.error("Please enter your email first.");
      return;
    }

    if (
      isEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      toast.error("Enter a valid email address.");
      return;
    }

    if (!isEmail && !/^\+\d{8,15}$/.test(phone)) {
      toast.error("Enter a valid phone number.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/otp/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          destination: isEmail ? email : phone,
          purpose: "signup",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || "Unable to send OTP.");
        return;
      }

      if (isEmail) {
        setEmailOtpSent(true);
        setEmailOtp("");
      } else {
        setPhoneOtpSent(true);
        setPhoneOtp("");
      }

      toast.success(
        `OTP sent successfully to your ${isEmail ? "email" : "phone"}!`
      );
    } catch (error) {
      console.error("Send OTP error:", error);
      toast.error("Unable to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOtp = async (type) => {
    if (loading) return;

    const isEmail = type === "email";
    const otp = isEmail ? emailOtp.trim() : phoneOtp.trim();

    const destination = isEmail
      ? form.email.trim().toLowerCase()
      : `${form.countryCode}${form.phone}`.replace(
          /[\s()-]/g,
          ""
        );

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/otp/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          destination,
          otp,
          purpose: "signup",
        }),
      });

      const contentType = response.headers.get("content-type");

if (!contentType || !contentType.includes("application/json")) {
  const errorText = await response.text();

  console.error("OTP API returned non-JSON:", {
    status: response.status,
    response: errorText,
  });

  toast.error(`OTP API error: HTTP ${response.status}`);
  return;
}

const data = await response.json();

if (!response.ok || !data.success) {
  toast.error(data.message || "Unable to send OTP.");
  return;
}

      if (isEmail) {
        setEmailVerified(true);
      } else {
        setPhoneVerified(true);
      }

      toast.success(
        `${isEmail ? "Email" : "Phone"} verified successfully!`
      );
    } catch (error) {
      console.error("Verify OTP error:", error);
      toast.error("Unable to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Move between signup steps
  const nextStep = () => {
    if (step === 1) {
      if (
        !form.name.trim() ||
        !form.email.trim() ||
        !form.password ||
        !form.confirmPassword
      ) {
        toast.error("Fill all fields.");
        return;
      }

      if (!passwordRegex.test(form.password)) {
        toast.error(
          "Password must contain uppercase, lowercase, number, special character and at least 8 characters."
        );
        return;
      }

      if (form.password !== form.confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }

      if (!emailVerified) {
        toast.error("Please verify your email before continuing.");
        return;
      }
    }

    setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Create account
  const handleSignup = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!emailVerified) {
      toast.error("Please verify your email.");
      setStep(1);
      return;
    }

    // Phone verification is required if a phone number was entered
    if (form.phone.trim() && !phoneVerified) {
      toast.error("Please verify your phone number.");
      return;
    }

    setLoading(true);

    try {
      const phone = form.phone.trim()
        ? `${form.countryCode}${form.phone}`.replace(
            /[\s()-]/g,
            ""
          )
        : "";

      const response = await fetch(`${API}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          exam: form.exam,
          className: form.className,
          phone,
          city: form.city,
          college: form.college,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || "Signup failed.");
        return;
      }

      if (!data.user) {
        toast.success("Account created. Please log in.");
        navigate("/login", { replace: true });
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.removeItem("currentChatId");

      toast.success("Signup Successful 🎉");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Server Error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h1>Signup to Doubtify 🚀</h1>

      <div className="step-indicator">
        Step {step} of 3
      </div>

      <form className="login-form" onSubmit={handleSignup}>
        {/* STEP 1: BASIC DETAILS */}

        {step === 1 && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

            <small>
              Password: 8+ chars, Uppercase, Lowercase, Number,
              Special Character
            </small>

            {/* EMAIL OTP SECTION */}

            <div className="otp-section">
              <button
                type="button"
                className="otp-send-button"
                onClick={() => sendOtp("email")}
                disabled={loading || emailVerified}
              >
                {emailVerified
                  ? "✓ Email Verified"
                  : loading
                  ? "Sending OTP..."
                  : emailOtpSent
                  ? "Resend Email OTP"
                  : "Verify Email"}
              </button>

              {emailOtpSent && !emailVerified && (
                <div className="otp-verify-box">
                  <input
                    type="text"
                    name="emailOtp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="Enter 6-digit Email OTP"
                    value={emailOtp}
                    onChange={(e) =>
                      setEmailOtp(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      )
                    }
                  />

                  <button
                    type="button"
                    className="otp-verify-button"
                    onClick={() => verifyOtp("email")}
                    disabled={loading || emailOtp.length !== 6}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              )}
            </div>

            <button type="button" onClick={nextStep}>
              Next →
            </button>
          </>
        )}

        {/* STEP 2: ACADEMIC DETAILS */}

        {step === 2 && (
          <>
            <select
              name="exam"
              value={form.exam}
              onChange={handleChange}
            >
              <option value="">Select Exam</option>
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
              <option value="">Education Level</option>
              <option>Class 9</option>
              <option>Class 10</option>
              <option>Class 11</option>
              <option>Class 12</option>
              <option>College</option>
              <option>Graduate</option>
            </select>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" onClick={prevStep}>
                ← Back
              </button>

              <button type="button" onClick={nextStep}>
                Next →
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
              >
                Skip
              </button>
            </div>
          </>
        )}

        {/* STEP 3: CONTACT DETAILS */}

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
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            {/* PHONE OTP SECTION */}

            <div className="otp-section">
              <button
                type="button"
                className="otp-send-button"
                onClick={() => sendOtp("phone")}
                disabled={
                  loading ||
                  phoneVerified ||
                  !form.phone.trim()
                }
              >
                {phoneVerified
                  ? "✓ Phone Verified"
                  : loading
                  ? "Sending OTP..."
                  : phoneOtpSent
                  ? "Resend Phone OTP"
                  : "Verify Phone"}
              </button>

              {phoneOtpSent && !phoneVerified && (
                <div className="otp-verify-box">
                  <input
                    type="text"
                    name="phoneOtp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="Enter 6-digit Phone OTP"
                    value={phoneOtp}
                    onChange={(e) =>
                      setPhoneOtp(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      )
                    }
                  />

                  <button
                    type="button"
                    className="otp-verify-button"
                    onClick={() => verifyOtp("phone")}
                    disabled={loading || phoneOtp.length !== 6}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              )}
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

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={prevStep}
                disabled={loading}
              >
                ← Back
              </button>

              <button type="submit" disabled={loading}>
                {loading ? "Creating Account..." : "Signup 🚀"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}