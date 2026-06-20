import axios from "axios";
import "./Profile.css";
import BackButton from "./BackButton";
import React, { useState, useEffect } from "react";

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

useEffect(() => {
  if (userId) {
    fetchProfile();
  }
}, [userId]);

const fetchProfile = async () => {
  try {
    const res = await axios.get(
      `https://doubtify-0q6d.onrender.com/api/user/profile/${userId}`
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

    if (res.data.profilePic) {
      setImage(
        `https://doubtify-0q6d.onrender.com${res.data.profilePic}`
      );
    }
  } catch (err) {
    console.log(err);
  }
};

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedFile(file);
    setImage(URL.createObjectURL(file));
    setImageChanged(true);
    setIsEditing(true);
  };

const uploadProfilePic = async () => {
  if (!selectedFile) return;

  const formData = new FormData();

  formData.append(
    "profilePic",
    selectedFile
  );

  const res = await axios.post(
    `https://doubtify-0q6d.onrender.com/api/user/upload-profile/${userId}`,
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  if (res.data.profilePic) {
    setImage(
      `https://doubtify-0q6d.onrender.com${res.data.profilePic}`
    );
  }
};

const handleSave = async () => {
  try {
    if (selectedFile) {
      await uploadProfilePic();
    }

    await axios.put(
      `https://doubtify-0q6d.onrender.com/api/user/profile/${userId}`,
      user
    );

    setIsEditing(false);
    setImageChanged(false);
    setSelectedFile(null);

    localStorage.setItem(
      "user",
      JSON.stringify({
        ...storedUser,
        ...user,
      })
    );

    alert("Profile Updated ✅");
  } catch (err) {
    console.log(err);
    alert("Update Failed ❌");
  }
};

  return (
    <>
      <BackButton />

      <div className="profile-container">

        {/* SIDEBAR */}

        <div className="profile-sidebar">

          <div className="avatar">
            {image ? (
              <img
                src={image}
                alt="profile"
              />
            ) : (
              <span>👤</span>
            )}
          </div>

          <label className="upload-btn">
            {image
              ? "Change Photo"
              : "Upload Photo"}

            <input
              type="file"
              accept="image/*"
              onChange={
                handleImageUpload
              }
              hidden
            />
          </label>

          <ul>
            <li
              className={
                activeTab === "profile"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab("profile")
              }
            >
              Profile Details
            </li>

            <li
              className={
                activeTab === "activity"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab(
                  "activity"
                )
              }
            >
              My Activity
            </li>
          </ul>

        </div>

        {/* CONTENT */}

        <div className="profile-content">

          {activeTab === "profile" && (
            <>
              <div className="profile-header">

                <h2>
                  Profile Details
                </h2>

                {!isEditing &&
                !imageChanged ? (
                  <button
                    onClick={() =>
                      setIsEditing(
                        true
                      )
                    }
                  >
                    Edit ✏️
                  </button>
                ) : (
                  <button
                    onClick={
                      handleSave
                    }
                  >
                    Save ✅
                  </button>
                )}

              </div>

              <div className="profile-grid">

                <div className="field">
                  <label>Name</label>

                  <input
                    name="name"
                    value={user.name}
                    onChange={
                      handleChange
                    }
                    disabled={
                      !isEditing
                    }
                  />
                </div>

                <div className="field">
                  <label>Email</label>

                  <input
                    name="email"
                    value={user.email}
                    onChange={
                      handleChange
                    }
                    disabled={
                      !isEditing
                    }
                  />
                </div>

                <div className="field">
                  <label>Exam</label>

                  <input
                    name="exam"
                    value={user.exam}
                    onChange={
                      handleChange
                    }
                    disabled={
                      !isEditing
                    }
                  />
                </div>

                <div className="field">
                  <label>Class</label>

                  <input
                    name="className"
                    value={
                      user.className
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      !isEditing
                    }
                  />
                </div>

                <div className="field">
                  <label>City</label>

                  <input
                    name="city"
                    value={user.city}
                    onChange={
                      handleChange
                    }
                    disabled={
                      !isEditing
                    }
                  />
                </div>

                <div className="field">
                  <label>Phone</label>

                  <input
                    name="phone"
                    value={user.phone}
                    onChange={
                      handleChange
                    }
                    disabled={
                      !isEditing
                    }
                  />
                </div>

                <div className="field">
                  <label>College</label>

                  <input
                    name="college"
                    value={
                      user.college
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      !isEditing
                    }
                  />
                </div>

              </div>
            </>
          )}

          {activeTab === "activity" && (
            <div className="tab-box">

              <h2>
                My Activity 📊
              </h2>

              <div className="activity-card">
                <h3>12</h3>
                <span>
                  Doubts Saved
                </span>
              </div>

              <div className="activity-card">
                <h3>8</h3>
                <span>
                  Notes Uploaded
                </span>
              </div>

              <div className="activity-card">
                <h3>5</h3>
                <span>
                  Events Created
                </span>
              </div>

            </div>
          )}

        </div>

      </div>
    </>
  );
}