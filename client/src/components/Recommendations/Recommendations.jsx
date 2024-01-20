import React, { useEffect, useState } from "react";
import axios from "axios";
import RefreshIcon from "@mui/icons-material/Refresh";
import profilePic from "../../images/Screenshot 2024-01-07 163823.png";
import "./recommendation.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

function Recommendations() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve the user information from local storage
    const user = JSON.parse(localStorage.getItem("user"));
    setLoggedInUser(user);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = window.localStorage.getItem("x-auth-token");
        const response = await axios.get(
          "http://localhost:8000/merny/api/v1/auth/findUser",
          {
            headers: {
              "x-auth-token": token,
            },
          }
        );

        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          console.error("Invalid data structure:", response.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Fetch followed users when the component mounts
    const fetchFollowedUsers = async () => {
      try {
        const token = window.localStorage.getItem("x-auth-token");
        const response = await axios.get(
          "http://localhost:8000/merny/api/v1/auth/getFollowingUsers",
          {
            headers: {
              "x-auth-token": token,
            },
          }
        );

        if (response.data.users && Array.isArray(response.data.users)) {
          // Extract the IDs of the followed users
          const followedUserIds = response.data.users.map((user) => user._id);

          // Update the followedUsers state
          setFollowedUsers(followedUserIds);

          // Check if the currently displayed user is being followed
          if (users.length > 0) {
            setIsFollowing(followedUserIds.includes(users[0].userId));
          }
        } else {
          console.error("Invalid data structure:", response.data);
        }
      } catch (error) {
        console.error("Error fetching followed users:", error);
      }
    };

    fetchFollowedUsers();
  }, [users]); // Update the dependency to trigger the effect when users change

  const handleFollowUser = async (userId) => {
    const token = window.localStorage.getItem("x-auth-token");
    try {
      const response = await axios.patch(
        `http://localhost:8000/merny/api/v1/auth/followUser/${userId}`,
        {},
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      // Log the entire response object
      console.log("Follow User Response:", response);

      // Handle success, you may want to update the UI accordingly
      console.log(`Successfully followed user with ID: ${userId}`);

      // Update the followedUsers state to include the newly followed user
      setFollowedUsers([...followedUsers, userId]);

      // Update the isFollowing state
      setIsFollowing(true);
    } catch (error) {
      console.error(`Error following user with ID ${userId}`, error);
    }
  };

  const handleUnfollowUser = async (userId) => {
    const token = window.localStorage.getItem("x-auth-token");
    try {
      const response = await axios.patch(
        `http://localhost:8000/merny/api/v1/auth/unfollowUser/${userId}`,
        {},
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      // Log the entire response object
      console.log("Unfollow User Response:", response);

      // Handle success, you may want to update the UI accordingly
      console.log(`Successfully unfollowed user with ID: ${userId}`);

      // Update the followedUsers state to exclude the unfollowed user
      setFollowedUsers(followedUsers.filter((id) => id !== userId));

      // Update the isFollowing state
      setIsFollowing(false);
    } catch (error) {
      console.error(`Error unfollowing user with ID ${userId}`, error);
    }
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleUserProfileClick = (user) => {
    console.log("Clicked User:", user);
    // Pass the selected user details to the UserProfile component
    navigate(`/user/${user.username}`, { state: { user } });
  };

  return (
    <div className="FollowersCard">
      <div className="user">
        <div>
          <img
            src={profilePic}
            alt="profilePicture"
            className="follower_profilePic"
          />
        </div>
        <div className="username">
          <h6 onClick={handleProfileClick}>
            {loggedInUser ? loggedInUser.user : "Default User"}
          </h6>
          <p>{loggedInUser ? loggedInUser.user : "Default User"}</p>
        </div>
      </div>
      <div className="follower_heading">
        <div className="heading">
          <h3>Recommendations</h3>
        </div>
        <div className="refresh_icon">
          <RefreshIcon sx={{ cursor: "pointer" }} />
        </div>
      </div>
      {users.map((user, index) => (
        <div key={index}>
          <div className="followers">
            <div className="followers_content">
              <img
                src={user.profilePic || profilePic}
                alt="FollowerImage"
                className="followerImg"
              />
              <div className="name">
                <div onClick={() => handleUserProfileClick(user)}>
                  {/* Use Link to navigate to user profile */}
                  <Link to={`/user/${user.username}`} className="user_name">
                    {user.username}
                  </Link>
                </div>
                <span>{user.name}</span>
              </div>
            </div>
            {followedUsers.includes(user.userId) || isFollowing ? (
              // Render Unfollow button if user is followed or isFollowing is true
              <button
                className="recommendation_unfollow_button"
                onClick={() => {
                  // Implement the logic to unfollow the user
                  handleUnfollowUser(user.userId);
                }}
              >
                Unfollow
              </button>
            ) : (
              // Render Follow button if user is not followed
              <button
                className="follow_button"
                onClick={() => {
                  handleFollowUser(user.userId);
                }}
              >
                Follow
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Recommendations;
