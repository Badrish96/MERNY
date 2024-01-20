import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import axios from "axios";
import { useDispatch } from "react-redux";
import {
  createPostStart,
  createPostSuccess,
  createPostFailure,
} from "../../Slice/PostSlice";
import { Camera } from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";
import "./createPost.css";

export default function CreatePost({ onClose, selectedImage }) {
  const dispatch = useDispatch();
  const [content, setContent] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [images, setImage] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setLoggedInUser(user);
  }, []);

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handlePostClick = async () => {
    try {
      const token = window.localStorage.getItem("x-auth-token");

      dispatch(createPostStart(content));

      let postData = { content };

      // Check if an image is selected
      if (selectedImage) {
        postData.images = selectedImage;
      } else if (capturedImage) {
        // Use capturedImage if available
        postData.images = capturedImage;
      } else if (images) {
        // Use either selectedImage or image
        const data = new FormData();
        data.append("file", images);
        data.append("upload_preset", "mernySocial");
        data.append("cloud_name", "mernyApp"); // Use cloud_name instead of dczq8hvxy

        // Upload image to Cloudinary
        const cloudinaryResponse = await axios.post(
          "https://api.cloudinary.com/v1_1/dczq8hvxy/image/upload",
          data
        );

        // Set the Cloudinary URL in the postData
        postData.images = cloudinaryResponse.data.secure_url;
      }

      const response = await axios.post(
        "http://localhost:8000/merny/api/v1/auth/addPost",
        postData,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      dispatch(createPostSuccess(response.data));
      onClose();
    } catch (error) {
      console.error("Error creating post:", error);
      dispatch(
        createPostFailure(
          error.message || "An error occurred while creating the post"
        )
      );
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleCameraClick = () => {
    setShowWebcam(true);
  };

  const handlePhotoClick = () => {
    document.getElementById("photoInput").click();
  };

  const handleCaptureImage = (dataUri) => {
    setCapturedImage(dataUri);
    setShowWebcam(false);
  };

  return (
    <div className="createPostModal">
      <div className="createPost">
        <div className="createPost_heading">
          <div>
            <h4>Create Post</h4>
          </div>
          <div onClick={onClose}>
            <CloseIcon sx={{ cursor: "pointer", marginBottom: "10px" }} />
          </div>
        </div>
        <hr />
        <div>
          <textarea
            placeholder={`Hi, ${
              loggedInUser ? loggedInUser.user : "user"
            }! What's on your mind?`}
            value={content}
            onChange={handleContentChange}
          />
          <div className="select_emoji">😄</div>
        </div>
        <div className="icons">
          <div onClick={handleCameraClick}>
            <CameraAltIcon sx={{ fontSize: "2.5rem", cursor: "pointer" }} />
            {showWebcam && (
              <Camera
                idealFacingMode="environment"
                onTakePhoto={(dataUri) => handleCaptureImage(dataUri)}
              />
            )}
          </div>
          {showWebcam && (
            <div>
              <button onClick={handleCaptureImage} className="capture_img">
                Capture Image
              </button>
            </div>
          )}
          <div onClick={handlePhotoClick}>
            <InsertPhotoIcon sx={{ fontSize: "2.5rem", cursor: "pointer" }} />
            <input
              type="file"
              id="photoInput"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>
          {selectedImage && (
            <div className="selectedImageContainer">
              <img
                src={selectedImage}
                alt="SelectedImage"
                className="selectedImage"
              />
            </div>
          )}
        </div>
        <button className="post_button" onClick={handlePostClick}>
          Post
        </button>
      </div>
    </div>
  );
}
