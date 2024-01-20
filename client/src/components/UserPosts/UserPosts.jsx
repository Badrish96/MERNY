import React, { useState, useEffect } from "react";
import axios from "axios";

function UserPosts() {
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const token = window.localStorage.getItem("x-auth-token");

      try {
        const userToken = JSON.parse(atob(token.split(".")[1])); // Decoding JWT token
        const username = userToken.user;

        if (!username) {
          console.error("Username is not available in the token");
          return;
        }

        // Fetch user ID by username
        const userIdResponse = await axios.get(
          `http://localhost:8000/merny/api/v1/auth/getUserIdByUsername/${username}`,
          {
            headers: {
              "x-auth-token": token,
            },
          }
        );

        const userId = userIdResponse.data.userId;

        // Fetch user posts using the retrieved user ID
        const response = await axios.get(
          `http://localhost:8000/merny/api/v1/auth/getUserPost/${userId}`,
          {
            headers: {
              "x-auth-token": token,
            },
          }
        );

        setUserPosts(response.data.posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div>
      <div className="row">
        {userPosts.map((post) => (
          <div key={post._id} className="col-4">
            {post.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`post_${post._id}_${index}`}
                className="postPic"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserPosts;
