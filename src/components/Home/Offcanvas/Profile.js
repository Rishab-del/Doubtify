import axios from "axios";
import "./Profile.css";
import BackButton from "./BackButton";
import React, { useState, useEffect } from "react";

const API_URL = "https://doubtify-0q6d.onrender.com";

export default function Profile() {
  const storedUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

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
  const [imageChanged, setImageChanged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =====================================
  // FETCH PROFILE
  // =====================================

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      if (!userId) {
        setLoading(false);
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
          setImage(
            `${API_URL}${res.data.profilePic}`
          );
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Profile fetch failed:", err);
          alert("Unable to load profile.");
        }
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
  }, [userId]);

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
      alert("Please select a valid image.");
      e.target.value = "";
      return;
    }

    // Limit image size to 5 MB.
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5 MB.");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);

    setImage(URL.createObjectURL(file));

    setImageChanged(true);
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
      setImage(
        `${API_URL}${res.data.profilePic}`
      );
    }
  };

  // =====================================
  // SAVE PROFILE
  // =====================================

  const handleSave = async () => {
    if (!userId) {
      alert("Please log in again.");
      return;
    }

    setSaving(true);

    try {
      if (selectedFile) {
        await uploadProfilePic();
      }

      await axios.put(
        `${API_URL}/api/user/profile/${userId}`,
        user
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...storedUser,
          ...user,
        })
      );

      setIsEditing(false);
      setImageChanged(false);
      setSelectedFile(null);

      alert("Profile updated successfully! ✅");
    } catch (err) {
      console.error("Profile update failed:", err);

      alert(
        err.response?.data?.message ||
          "Profile update failed. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================
  // CANCEL EDITING
  // =====================================

  const handleCancel = () => {
    setIsEditing(false);
    setImageChanged(false);
    setSelectedFile(null);

    // Reload the saved profile to discard unsaved changes.
    if (userId) {
      axios
        .get(`${API_URL}/api/user/profile/${userId}`)
        .then((res) => {
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
        })
        .catch((err) => {
          console.error("Unable to reload profile:", err);
        });
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

      <div className="profile-container">
        {/* LEFT SIDEBAR */}

        <aside className="profile-sidebar">
          {/* Profile Photo */}

          <div className="avatar">
            {image ? (
              <img
                src={image}
                alt="Profile"
              />
            ) : (
              <span>👤</span>
            )}
          </div>

          {/* Upload Photo */}

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

          {/* Sidebar Navigation */}

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
          {/* PROFILE DETAILS */}

          {activeTab === "profile" && (
            <>
              <div className="profile-header">
                <div>
                  <h1>Profile Details</h1>

                  <p className="profile-description">
                    Manage your personal information.
                  </p>
                </div>

                {!isEditing && !imageChanged ? (
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
                      {saving ? "Saving..." : "✓ Save"}
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
                    onChange={handleChange}
                    disabled={!isEditing || saving}
                    placeholder="Enter your email"
                  />
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