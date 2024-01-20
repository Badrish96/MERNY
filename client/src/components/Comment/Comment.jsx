import React, { useState, useEffect } from "react";
import "./comment.css";
import profilePic from "../../images/Screenshot 2024-01-07 163823.png";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import Modal from "@mui/material/Modal";
import Backdrop from "@mui/material/Backdrop";
import Fade from "@mui/material/Fade";
import { useDispatch } from "react-redux";
import {
  createCommentStart,
  createCommentSuccess,
  createCommentFailure,
} from "../../Slice/CommentSlics";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";

export default function CommentSkeleton({ postId, postUserId }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const dispatch = useDispatch();
  const [content, setContent] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedCommentId, setSelectedCommentId] = React.useState(null);
  const [editCommentContent, setEditCommentContent] = React.useState("");
  const [likedComments, setLikedComments] = React.useState([]);

  useEffect(() => {
    // Retrieve the user information from local storage
    const user = JSON.parse(localStorage.getItem("user"));
    setLoggedInUser(user);
  }, []);
  const loggedInUserName = loggedInUser ? loggedInUser.fullName : "";

  useEffect(() => {
    const fetchComments = async () => {
      const token = window.localStorage.getItem("x-auth-token");

      try {
        const response = await axios.get(
          `http://localhost:8000/merny/api/v1/auth/getComments/${postId}`,
          {
            headers: {
              "x-auth-token": token,
            },
          }
        );

        if (Array.isArray(response.data.comments)) {
          setComments([...response.data.comments]);
        } else {
          console.error("Invalid data structure in comments:", response.data);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [postId]);

  const handleCommentClick = async () => {
    try {
      const token = window.localStorage.getItem("x-auth-token");

      dispatch(createCommentStart(content));

      const response = await axios.post(
        "http://localhost:8000/merny/api/v1/auth/addComment",
        {
          postId,
          postUserId,
          content,
          reply: replyingTo,
        },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      dispatch(createCommentSuccess(response.data));

      // Reset state after posting a comment or reply
      setReplyingTo(null);
      setContent("");
    } catch (error) {
      console.error("Error creating comment:", error);
      dispatch(
        createCommentFailure(
          error.message || "An error occurred while creating the comment"
        )
      );
    }
  };

  const handleReply = (commentId) => {
    setReplyingTo(commentId);
    setModalOpen(true);
  };

  const handleMenuOpen = (event, commentId) => {
    setAnchorEl(event.currentTarget);
    setReplyingTo(commentId);
    setSelectedCommentId(commentId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setReplyingTo(null);
    setSelectedCommentId(null);
  };

  const handleEditComment = async () => {
    try {
      if (selectedCommentId) {
        await axios.patch(
          `http://localhost:8000/merny/api/v1/auth/updateComment/${selectedCommentId}`,
          {
            content: editCommentContent,
          },
          {
            headers: {
              "x-auth-token": window.localStorage.getItem("x-auth-token"),
            },
          }
        );

        setComments((prevComments) =>
          prevComments.map((c) =>
            c._id === selectedCommentId
              ? { ...c, content: editCommentContent }
              : c
          )
        );

        handleMenuClose();
      }
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditCommentContent("");
    setSelectedCommentId(null);
  };

  const handleRemoveComment = async () => {
    try {
      if (selectedCommentId) {
        // Add the logic to send a request to your backend to delete the comment by selectedCommentId
        await axios.delete(
          `http://localhost:8000/merny/api/v1/auth/deleteComment/${selectedCommentId}`,
          {
            headers: {
              "x-auth-token": window.localStorage.getItem("x-auth-token"),
            },
          }
        );

        // Update the local state to remove the deleted comment
        setComments((prevComments) =>
          prevComments.filter((c) => c._id !== selectedCommentId)
        );

        // Close the menu and reset editing state
        handleMenuClose();
      }
    } catch (error) {
      console.error("Error removing comment:", error);
    }
  };

  const handleToggleLike = async (commentId) => {
    try {
      if (likedComments.includes(postId)) {
        // If post is already liked, dislike it
        await axios.patch(
          `http://localhost:8000/merny/api/v1/auth/unlikeComment/${commentId}`,
          {},
          {
            headers: {
              "x-auth-token": window.localStorage.getItem("x-auth-token"),
            },
          }
        );
        setLikedComments((prevLikedComments) =>
          prevLikedComments.filter((id) => id !== commentId)
        );
      } else {
        // If post is not liked, like it
        await axios.patch(
          `http://localhost:8000/merny/api/v1/auth/likeComment/${commentId}`,
          {},
          {
            headers: {
              "x-auth-token": window.localStorage.getItem("x-auth-token"),
            },
          }
        );
        setLikedComments((prevLikedComments) => [
          ...prevLikedComments,
          commentId,
        ]);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <>
      {comments
        .filter((comment) => comment.postId === postId)
        .map((comment) => (
          <div className="container" key={comment._id}>
            <div className="comment_user">
              <div>
                <img
                  src={profilePic}
                  alt="comment_profilePic"
                  className="comment_profilePic"
                />
              </div>
              <div>
                <span className="comment_username">
                  {comment.user.fullName}
                </span>
              </div>
            </div>
            <div>
              <div className="comment_data">
                <p>{comment.content}</p>
              </div>
              <div className="comment_updates">
                <div className="comment_status">
                  <span>{comment.createdAt}</span>
                  <a href="#" className="comment_like_reply">
                    {comment.likes.length} likes
                  </a>
                  <a
                    href="#"
                    className="comment_like_reply"
                    onClick={() => handleReply(comment._id)}
                  >
                    reply
                  </a>
                </div>
                <div className="like_icon">
                  <MoreVertIcon
                    sx={{ color: "gray", cursor: "pointer" }}
                    onClick={(e) => handleMenuOpen(e, comment._id)}
                  />
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem sx={{ fontSize: "14px" }}>
                      <textarea
                        value={editCommentContent}
                        onChange={(e) => setEditCommentContent(e.target.value)}
                        placeholder="Edit comment..."
                        rows="4"
                        cols="50"
                      />
                    </MenuItem>
                    <MenuItem
                      onClick={handleEditComment}
                      sx={{ fontSize: "14px" }}
                    >
                      <EditIcon sx={{ fontSize: "1rem" }} /> Save Changes
                    </MenuItem>
                    <MenuItem
                      onClick={handleRemoveComment}
                      sx={{ fontSize: "14px" }}
                    >
                      <DeleteIcon sx={{ fontSize: "1rem" }} />
                      Remove
                    </MenuItem>
                  </Menu>
                  <IconButton
                    aria-label="add to favorites"
                    sx={{
                      width: "30px",
                      color: likedComments.includes(comment._id)
                        ? "gray"
                        : "#d32f2f",
                    }}
                    onClick={() => handleToggleLike(comment._id)}
                  >
                    <FavoriteIcon />
                  </IconButton>
                </div>
              </div>
            </div>
            <hr style={{ width: "103%", marginLeft: "-10px" }} />
          </div>
        ))}

      {/* Modal for reply */}
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={modalOpen}
        onClose={handleModalClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={modalOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "300px", // Adjust the width as needed
              p: 2,
              bgcolor: "background.paper",
              borderRadius: "8px",
              boxShadow: 24,
              textAlign: "center",
            }}
          >
            <input
              type="text"
              placeholder="Reply to comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button onClick={handleCommentClick}>Reply</button>
          </Box>
        </Fade>
      </Modal>

      {/* Add Comment Section */}
      <div className="container">
        <div className="comment_user">
          <div>
            <img
              src={profilePic}
              alt="comment_profilePic"
              className="comment_profilePic"
            />
          </div>
          <div>
            <span className="comment_username">{loggedInUserName}</span>
          </div>
        </div>
        <div>
          <div className="add_comment">
            <input
              placeholder="Add a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div className="comment_option">
            <a href="#" onClick={handleCommentClick}>
              {" "}
              😄 Comment
            </a>
          </div>
        </div>
        <hr style={{ width: "103%", marginLeft: "-10px" }} />
      </div>
    </>
  );
}
