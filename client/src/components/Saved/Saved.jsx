import React, { useState, useEffect } from "react";
import axios from "axios";
import "./saved.css";

function Saved() {
  const [savedPosts, setSavedPosts] = useState([]);

  useEffect(() => {
    // Fetch saved posts when the component mounts
    fetchSavedPosts();
  }, []);

  const fetchSavedPosts = async () => {
    try {
      const authToken = window.localStorage.getItem("x-auth-token");
      const response = await axios.get(
        "http://localhost:8000/merny/api/v1/auth/getSavedPost",
        {
          headers: {
            "x-auth-token": authToken,
          },
        }
      );

      const savedPostsData = response.data.savedPosts;
      setSavedPosts(savedPostsData);
    } catch (error) {
      console.error("Error fetching saved posts:", error);
    }
  };

  return (
    <div>
      <div className="row">
        {savedPosts.map((post) => (
          <div key={post._id} className="col-4">
            <img
              src={post.images[0]}
              alt={`post_${post._id}`}
              className="postPic"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Saved;
