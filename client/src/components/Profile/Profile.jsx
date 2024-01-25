import React, { useState, useEffect } from "react";
import axios from "axios";
import profilePic from "../../images/Screenshot 2024-01-07 163823.png";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EditProfile from "../EditProfile/EditProfile";
import CloseIcon from "@mui/icons-material/Close";
import Following from "../Following/Following";
import Followers from "../Followers/Follower";
import Saved from "../Saved/Saved";
import Navbar from "../Navbar/Navbar";
import "./profile.css";
import UserPosts from "../UserPosts/UserPosts";

export default function Profile() {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showPost, setShowPost] = useState(false);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showUserPosts, setShowUserPosts] = useState(true);
  const [showSavedPosts, setShowSavedPosts] = useState(false);

  useEffect(() => {
    // Retrieve the user information from local storage
    const user = JSON.parse(localStorage.getItem("user"));
    setLoggedInUser(user);
  }, []);

  useEffect(() => {
    // Fetch followers and following when the component mounts
    const fetchData = async () => {
      try {
        const token = window.localStorage.getItem("x-auth-token");

        // Fetch followers and following
        const followingResponse = await axios.get(
          "http://localhost:8000/merny/api/v1/auth/getFollowingUsers",
          {
            headers: {
              "x-auth-token": token,
            },
          }
        );

        const followersResponse = await axios.get(
          "http://localhost:8000/merny/api/v1/auth/getFollowers",
          {
            headers: {
              "x-auth-token": token,
            },
          }
        );

        setFollowingUsers(followingResponse.data.users);
        setFollowers(followersResponse.data.users);
      } catch (error) {
        console.error("Error fetching followers and following:", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures the effect runs only once on mount

  const handlePostClick = () => {
    setShowUserPosts(true);
    setShowSavedPosts(false);
  };

  const handleSavedClick = () => {
    setShowSavedPosts(true);
    setShowUserPosts(false);
  };

  const handleFollowingClick = () => {
    setShowFollowing(true);
  };

  const handleFollowingClose = () => {
    setShowFollowing(false);
  };

  const handleFollowerClick = () => {
    setShowFollowers(true);
  };

  const handleFollowerClose = () => {
    setShowFollowers(false);
  };

  const handleEditProfileClick = () => {
    setShowEditProfile(true);
  };

  const handleCloseEditProfile = () => {
    setShowEditProfile(false);
  };

  const handleSaveProfile = () => {
    // Logic to save profile data goes here
    setShowEditProfile(false); // Close the edit profile modal after saving
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="profile_heading">
          <div>
            <img src={profilePic} alt="profilePic" />
          </div>
          <div className="profile_sub_heading">
            <div className="profile_name">
              <h4>{`${loggedInUser ? loggedInUser.user : "user"}`}</h4>
            </div>
            <div>
              <a
                href="#"
                style={{ marginLeft: "1px" }}
                onClick={handleFollowerClick}
              >
                {followers.length} Followers
              </a>
              <a href="#" onClick={handleFollowingClick}>
                {followingUsers.length} Following
              </a>
            </div>
            <div>
              <LocationOnIcon sx={{ color: "#5b5f60" }} />
              <span style={{ fontSize: "12px" }}>Gurgaon, Haryana</span>
            </div>
          </div>
          <div>
            <button onClick={handleEditProfileClick}>Edit Profile</button>
          </div>
        </div>
        <hr className="line" />
        <div className="saved_post">
          <div>
            <button onClick={handlePostClick}>Post</button>
          </div>
          <div>
            <button
              style={{ padding: "5px 15px", marginLeft: "10px" }}
              onClick={handleSavedClick}
            >
              Saved
            </button>
          </div>
        </div>
        <hr style={{ margin: "0px" }} />
        {showEditProfile && (
          <div className="edit-profile-modal-overlay">
            <div className="edit-profile-modal">
              <div className="edit-profile-header">
                <div onClick={handleCloseEditProfile}>
                  <CloseIcon />
                </div>
                <div className="profile">
                  <img
                    src={profilePic}
                    alt="profilePic"
                    className="profilePic"
                  />
                </div>
              </div>
              <EditProfile
                onClose={handleCloseEditProfile}
                onSave={handleSaveProfile}
              />
            </div>
          </div>
        )}
        {showFollowing && (
          <div>
            <Following
              followingUsers={followingUsers}
              onClose={handleFollowingClose}
            />
          </div>
        )}
        {showFollowers && (
          <div>
            <Followers followers={followers} onClose={handleFollowerClose} />
          </div>
        )}
        {showSavedPosts && (
          <div>
            <Saved />
          </div>
        )}
        {showUserPosts && (
          <div>
            <UserPosts />
          </div>
        )}
      </div>
    </div>
  );
}
