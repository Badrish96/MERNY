import React, { useState, useEffect } from "react";
import axios from "axios";
import profilePic from "../../images/Screenshot 2024-01-07 163823.png";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Navbar from "../Navbar/Navbar";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import { useLocation } from "react-router-dom";

export default function UserProfile() {
  const [showFollowing, setShowFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);

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

  const handleFollowClick = () => {
    // Logic to handle follow action goes here
  };
  const location = useLocation();
  const selectedUser = location?.state?.user || {};

  console.log(`Selected User ${selectedUser}`);
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
              <h4>
                {/* Display selected user's username */}
                <Link to={`/user/${selectedUser.fullName}`}>
                  {selectedUser.username || selectedUser.fullName}
                </Link>
              </h4>
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
              <span style={{ fontSize: "12px" }}>
                {selectedUser.location || "Location"}
              </span>
            </div>
          </div>
          <div>
            {/* Change button text and onClick event */}
            <button onClick={handleFollowClick}>Follow</button>
          </div>
        </div>
        <hr className="line" />
        <hr style={{ margin: "0px" }} />
        {showFollowing && <div>{/* Render the Following component */}</div>}
        {showFollowers && <div>{/* Render the Followers component */}</div>}
      </div>
    </div>
  );
}
