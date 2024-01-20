import React, { useState } from "react";
import profilePic from "../../images/Screenshot 2024-01-07 163823.png";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import "./editProfile.css";

function EditProfile({ onClose }) {
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    address: "",
    website: "",
    bio: "",
    gender: "male", // Default gender
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Assuming you have the token stored in localStorage
      const token = window.localStorage.getItem("x-auth-token");

      // Send a PATCH request to update user info
      await axios.patch(
        "http://localhost:8000/merny/api/v1/auth/user",
        formData,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      // Close the modal or perform any other actions upon successful update
      onClose();
    } catch (error) {
      console.error("Error updating user info:", error);
      // Handle the error, show a message, etc.
    }
  };

  return (
    <div className="edit-profile-modal">
      <div className="edit-profile-content">
        <div className="edit-profile-header">
          <div onClick={onClose}>
            <CloseIcon sx={{ fontSize: "12px", cursor: "pointer" }} />
          </div>
          <div className="profile">
            <img src={profilePic} alt="profilePic" />
          </div>
        </div>
        <form onSubmit={handleSubmit} className="edit-profile-form">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
          />

          <label htmlFor="mobile">Mobile</label>
          <input
            type="text"
            id="mobile"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
          />

          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />

          <label htmlFor="website">Website</label>
          <input
            type="text"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
          />

          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
          ></textarea>

          <label htmlFor="gender">Gender</label>
          <div className="custom-select">
            <select
              id="gender"
              name="gender"
              className="gender_selector"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <div className="select-arrow-up"></div>
            <div className="select-arrow-down"></div>
          </div>

          <div>
            <button type="submit" className="save_button">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
