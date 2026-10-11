import axios from "axios";
import "./Profile.css";
import BackButton from "./BackButton";
import React, { useState, useEffect, useCallback } from "react";

const API_URL = "https://doubtify-0q6d.onrender.com";

export default function Profile() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedFile, setSelectedFile] = useState(null);

  const [user, setUser] = useState({
    name: "",
    email: "",
    exam: "",
    className: "",
    city: "",
    phone: "",
    college: "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  // =====================================
  // CUSTOM NOTIFICATION
  // =====================================

  const showNotification = useCallback((type, title, message) => {
    setNotification({
      show: true,
      type,
      title,
      message,
    });
  }, []);

  const closeNotification = () => {
    setNotification((prev) => ({
      ...prev,
      show: false,
    }));
  };

  useEffect(() => {
    if (!notification.show) return;

    const timer = setTimeout(() => {
      setNotification((prev) => ({
        ...prev,
        show: false,
      }));
    }, 3500);

    return () => clearTimeout(timer);
  }, [notification]);

  // =====================================
  // FETCH PROFILE
  // =====================================

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      if (!userId) {
        setLoading(false);

        showNotification(
          "error",
          "Login required",
          "Please log in again to access your profile."
        );

        return;
      }

      try {
        const res = await axios.get(
          `${API_URL}/api/user/profile/${userId}`
        );

        if (cancelled) return;

        setUser({
          name: res.data.name || "",
          email: res.data.email || "",
          exam: res.data.exam || "",
          className: res.data.className || "",
          city: res.data.city || "",
          phone: res.data.phone || "",
          college: res.data.college || "",
        });

        if (res.data.profilePic) {
          setImage(`${API_URL}${res.data.profilePic}`);
        }
      } catch (err) {
        if (cancelled) return;

        console.error("Profile fetch failed:", err);

        showNotification(
          "error",
          "Unable to load profile",
          "Please check your connection and try again."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [userId, showNotification]);

  // =====================================
  // INPUT CHANGE
  // =====================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  // =====================================
  // IMAGE UPLOAD PREVIEW
  // =====================================

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification(
        "error",
        "Invalid image",
        "Please select a valid image file."
      );

      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification(
        "error",
        "Image too large",
        "Please choose an image smaller than 5 MB."
      );

      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    setImage(URL.createObjectURL(file));
    setIsEditing(true);
  };

  // =====================================
  // UPLOAD PROFILE PHOTO
  // =====================================

  const uploadProfilePic = async () => {
    if (!selectedFile) return;

    const formData = new FormData();

    formData.append("profilePic", selectedFile);

    const res = await axios.post(
      `${API_URL}/api/user/upload-profile/${userId}`,
      formData
    );

    if (res.data.profilePic) {
      setImage(`${API_URL}${res.data.profilePic}`);
    }
  };

  // =====================================
  // SAVE PROFILE
  // =====================================

  const handleSave = async () => {
    if (!userId) {
      showNotification(
        "error",
        "Login required",
        "Please log in again to update your profile."
      );

      return;
    }

    if (!user.name.trim()) {
      showNotification(
        "error",
        "Name required",
        "Please enter your name before saving."
      );

      return;
    }

    setSaving(true);

    try {
      if (selectedFile) {
        await uploadProfilePic();
      }

      const updatedData = {
        name: user.name.trim(),
        exam: user.exam.trim(),
        className: user.className.trim(),
        city: user.city.trim(),
        phone: user.phone.trim(),
        college: user.college.trim(),
      };

      const res = await axios.put(
        `${API_URL}/api/user/profile/${userId}`,
        updatedData
      );

      if (res.status !== 200) {
        throw new Error("Profile update failed");
      }

      
      const updatedUser = {
  ...storedUser,
  ...user,
  ...updatedData,
  id: userId,
  name: updatedData.name,
  email: user.email,
};

localStorage.setItem("user", JSON.stringify(updatedUser));

// Dashboard ke liye updated name save karo
localStorage.setItem("userName", updatedUser.name);

setUser((prev) => ({
  ...prev,
  ...updatedData,
}));

      setIsEditing(false);
      setSelectedFile(null);

      showNotification(
        "success",
        "Profile updated!",
        "Your personal information has been saved successfully."
      );
    } catch (err) {
      console.error("Profile update failed:", err);

      showNotification(
        "error",
        "Update failed",
        err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================
  // CANCEL EDITING
  // =====================================

  const handleCancel = async () => {
    if (saving) return;

    setIsEditing(false);
    setSelectedFile(null);

    if (!userId) return;

    try {
      const res = await axios.get(
        `${API_URL}/api/user/profile/${userId}`
      );

      setUser({
        name: res.data.name || "",
        email: res.data.email || "",
        exam: res.data.exam || "",
        className: res.data.className || "",
        city: res.data.city || "",
        phone: res.data.phone || "",
        college: res.data.college || "",
      });

      setImage(
        res.data.profilePic
          ? `${API_URL}${res.data.profilePic}`
          : null
      );
    } catch (err) {
      console.error("Unable to reload profile:", err);

      showNotification(
        "error",
        "Unable to reset changes",
        "Please refresh the page and try again."
      );
    }
  };

  // =====================================
  // LOADING STATE
  // =====================================

  if (loading) {
    return (
      <>
        <BackButton />

        <div className="profile-container profile-loading">
          <div className="profile-loader" />
          <p>Loading your profile...</p>
        </div>
      </>
    );
  }

  // =====================================
  // MAIN UI
  // =====================================

  return (
    <>
      <BackButton />

      {/* PREMIUM NOTIFICATION */}

      {notification.show && (
        <div
          className={`profile-toast ${notification.type}`}
          role="status"
          aria-live="polite"
        >
          <div className="toast-icon">
            {notification.type === "success" ? "✓" : "!"}
          </div>

          <div className="toast-content">
            <h3>{notification.title}</h3>
            <p>{notification.message}</p>
          </div>

          <button
            type="button"
            className="toast-close"
            onClick={closeNotification}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      <div className="profile-container">
        {/* LEFT SIDEBAR */}

        <aside className="profile-sidebar">
          <div className="avatar">
            {image ? (
              <img src={image} alt="Profile" />
            ) : (
              <span>👤</span>
            )}
          </div>

          <label
            className="upload-btn"
            htmlFor="profile-photo-input"
          >
            {image ? "📷 Change Photo" : "＋ Upload Photo"}

            <input
              id="profile-photo-input"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              hidden
            />
          </label>

          <nav className="profile-navigation">
            <button
              type="button"
              className={
                activeTab === "profile"
                  ? "profile-nav-item active"
                  : "profile-nav-item"
              }
              onClick={() => setActiveTab("profile")}
            >
              <span className="profile-nav-icon">👤</span>
              <span>Profile Details</span>
            </button>

            <button
              type="button"
              className={
                activeTab === "activity"
                  ? "profile-nav-item active"
                  : "profile-nav-item"
              }
              onClick={() => setActiveTab("activity")}
            >
              <span className="profile-nav-icon">📊</span>
              <span>My Activity</span>
            </button>
          </nav>
        </aside>

        {/* RIGHT CONTENT */}

        <main className="profile-content">
          {activeTab === "profile" && (
            <>
              <div className="profile-header">
                <div>
                  <h1>Profile Details</h1>

                  <p className="profile-description">
                    Manage your personal information.
                  </p>
                </div>

                {!isEditing ? (
                  <button
                    type="button"
                    className="profile-action-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️ Edit
                  </button>
                ) : (
                  <div className="profile-action-group">
                    <button
                      type="button"
                      className="profile-action-btn save"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="button-spinner" />
                          Saving...
                        </>
                      ) : (
                        "✓ Save"
                      )}
                    </button>

                    <button
                      type="button"
                      className="profile-cancel-btn"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="profile-grid">
                <div className="field">
                  <label htmlFor="profile-name">Name</label>

                  <input
                    id="profile-name"
                    name="name"
                    value={user.name}
                    onChange={handleChange}
                    disabled={!isEditing || saving}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="field">
                  <label htmlFor="profile-email">Email</label>

                  <input
                    id="profile-email"
                    type="email"
                    name="email"
                    value={user.email}
                    disabled
                    placeholder="Your email address"
                  />

                  <small className="profile-field-hint">
                    Email address cannot be changed here.
                  </small>
                </div>

                <div className="field">
                  <label htmlFor="profile-exam">Exam</label>

                  <input
                    id="profile-exam"
                    name="exam"
                    value={user.exam}
                    onChange={handleChange}
                    disabled={!isEditing || saving}
                    placeholder="Enter your exam"
                  />
                </div>

                <div className="field">
                  <label htmlFor="profile-class">Class</label>

                  <input
                    id="profile-class"
                    name="className"
                    value={user.className}
                    onChange={handleChange}
                    disabled={!isEditing || saving}
                    placeholder="Enter your class"
                  />
                </div>

                <div className="field">
                  <label htmlFor="profile-city">City</label>

                  <input
                    id="profile-city"
                    name="city"
                    value={user.city}
                    onChange={handleChange}
                    disabled={!isEditing || saving}
                    placeholder="Enter your city"
                  />
                </div>

                <div className="field">
                  <label htmlFor="profile-phone">Phone</label>

                  <input
                    id="profile-phone"
                    type="tel"
                    name="phone"
                    value={user.phone}
                    onChange={handleChange}
                    disabled={!isEditing || saving}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="field">
                  <label htmlFor="profile-college">College</label>

                  <input
                    id="profile-college"
                    name="college"
                    value={user.college}
                    onChange={handleChange}
                    disabled={!isEditing || saving}
                    placeholder="Enter your college"
                  />
                </div>
              </div>
            </>
          )}

          {/* MY ACTIVITY */}

          {activeTab === "activity" && (
            <section className="tab-box">
              <div className="activity-header">
                <h1>My Activity</h1>

                <p className="profile-description">
                  Your Doubtify learning overview.
                </p>
              </div>

              <div className="activity-grid">
                <div className="activity-card">
                  <div className="activity-icon">💡</div>
                  <h3>12</h3>
                  <span>Doubts Saved</span>
                </div>

                <div className="activity-card">
                  <div className="activity-icon">📚</div>
                  <h3>8</h3>
                  <span>Notes Uploaded</span>
                </div>

                <div className="activity-card">
                  <div className="activity-icon">📅</div>
                  <h3>5</h3>
                  <span>Events Created</span>
                </div>
              </div>

              <p className="activity-note">
                Activity figures are sample values from the current UI.
              </p>
            </section>
          )}
        </main>
      </div>
    </>
  );
}