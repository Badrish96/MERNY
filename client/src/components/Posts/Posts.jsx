import React from "react";
import profilePic from "../../images/Screenshot 2024-01-07 163823.png";
import "./post.css";
import { useState, useEffect } from "react";
import CreatePost from "../CreatePost/CreatePost";

function Posts() {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    // Retrieve the user information from local storage
    const user = JSON.parse(localStorage.getItem("user"));
    setLoggedInUser(user);
  }, []);

  const handleCreatePostClick = () => {
    setShowCreatePost(true);
  };

  const CreatePostClose = () => {
    setShowCreatePost(false);
  };

  return (
    <div className="Post">
      <div>
        <img src={profilePic} alt="profilePicture" className="profilePic" />
      </div>
      <div className="status_input">
        <input
          type="text"
          placeholder={`What are you thinking, ${
            loggedInUser ? loggedInUser.user : "user"
          }?`}
          onClick={handleCreatePostClick}
        />
      </div>
      {showCreatePost && (
        <div>
          <CreatePost onClose={CreatePostClose} />
        </div>
      )}
    </div>
  );
}

export default Posts;
