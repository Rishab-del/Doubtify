import axios from "axios";
import "./Profile.css";
import BackButton from "./BackButton";
import React, { useState, useEffect } from "react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedFile, setSelectedFile] = useState(null);

  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    college: "",
  });
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5001/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        city: res.data.city || "",
        college: res.data.college || "",
      });

      if (res.data.profilePic) {
        setImage(`http://localhost:5001${res.data.profilePic}`);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const [image, setImage] = useState(null);
  const [imageChanged, setImageChanged] = useState(false);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
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

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("profilePic", selectedFile);

    const res = await axios.post(
      "http://localhost:5001/api/user/upload-profile",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    if (res.data && res.data.profilePic) {
      setImage(`http://localhost:5001${res.data.profilePic}`);
    }
  };

  const handleSave = async () => {
    
    try {
      const token = localStorage.getItem("token");

      if (selectedFile) {
        await uploadProfilePic();
      }
      await axios.put(
  "http://localhost:5001/api/user/profile",
  user,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      await axios.put("http://localhost:5001/api/user/profile", user, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsEditing(false);
      setImageChanged(false);
      setSelectedFile(null);

      alert("Profile Updated ✅");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <BackButton />
      <div className="profile-container">
        {/* LEFT */}
        <div className="profile-sidebar">
          <div className="avatar">
            {image ? <img src={image} alt="profile" /> : <span>👤</span>}
          </div>

          <label className="upload-btn">
            {image ? "Change Photo" : "Upload Photo"}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              hidden
            />
          </label>

          <ul>
            <li
              className={activeTab === "profile" ? "active" : ""}
              onClick={() => setActiveTab("profile")}
            >
              Profile Details
            </li>

            <li
              className={activeTab === "activity" ? "active" : ""}
              onClick={() => setActiveTab("activity")}
            >
              My Activity
            </li>
          </ul>
        </div>

        {/* RIGHT */}
        <div className="profile-content">
          {/* 🔥 PROFILE TAB */}
          {activeTab === "profile" && (
            <>
              <div className="profile-header">
                <h2>Profile Details</h2>

                {!isEditing && !imageChanged ? (
                  <button onClick={() => setIsEditing(true)}>Edit ✏️</button>
                ) : (
                  <button onClick={handleSave}>Save ✅</button>
                )}
              </div>

              <div className="profile-grid">
                <div className="field">
                  <label>Name</label>
                  <input
                    name="name"
                    value={user.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="field">
                  <label>Email</label>
                  <input
                    name="email"
                    value={user.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="field">
                  <label>Phone</label>
                  <input
                    name="phone"
                    value={user.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="field">
                  <label>City</label>
                  <input
                    name="city"
                    value={user.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="field">
                  <label>College</label>
                  <input
                    name="college"
                    value={user.college}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </>
          )}

          {/* 🔥 ACTIVITY TAB */}
          {activeTab === "activity" && (
            <div className="tab-box">
              <h2>My Activity 📊</h2>
              <p>Doubts solved: 12</p>
              <p>Notes created: 8</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
