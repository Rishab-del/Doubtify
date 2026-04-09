import React, { useState } from "react";
import "./Profile.css";
import BackButton from "./BackButton";

export default function Profile() {

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [user, setUser] = useState({
    name: "Rishabh Patel",
    email: "rishabh@email.com",
    phone: "7007387652",
    city: "Delhi",
    class: "B.Tech 1st Year",
    college: "IIIT Delhi",
  });

  const [image, setImage] = useState(null);
  const [imageChanged, setImageChanged] = useState(false);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setImageChanged(true);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    setImageChanged(false);
    alert("Profile Updated ✅");
  };

  return (
    <>
    <BackButton />
    <div className="profile-container">

      {/* LEFT */}
      <div className="profile-sidebar">

        <div className="avatar">
          {image ? <img src={image} alt="profile" /> : "👤"}
        </div>

        {/* 🔥 FIXED BUTTON TEXT */}
        <label className="upload-btn">
          {image ? "Change Photo" : "Upload Photo"}
          <input type="file" onChange={handleImageUpload} hidden />
        </label>


        <h3>{user.name}</h3>

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
                <input name="name" value={user.name} onChange={handleChange} disabled={!isEditing}/>
              </div>

              <div className="field">
                <label>Email</label>
                <input name="email" value={user.email} onChange={handleChange} disabled={!isEditing}/>
              </div>

              <div className="field">
                <label>Phone</label>
                <input name="phone" value={user.phone} onChange={handleChange} disabled={!isEditing}/>
              </div>

              <div className="field">
                <label>City</label>
                <input name="city" value={user.city} onChange={handleChange} disabled={!isEditing}/>
              </div>

              <div className="field">
                <label>Class</label>
                <input name="class" value={user.class} onChange={handleChange} disabled={!isEditing}/>
              </div>

              <div className="field">
                <label>College</label>
                <input name="college" value={user.college} onChange={handleChange} disabled={!isEditing}/>
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