import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import SendIcon from "@mui/icons-material/Send";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import axios from "axios";

import CommentSkeleton from "../Comment/Comment";

export default function Post() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [posts, setPosts] = React.useState([]);
  const [selectedPostId, setSelectedPostId] = React.useState(null);
  const [editPostContent, setEditPostContent] = React.useState("");
  const [editingStates, setEditingStates] = React.useState({});
  const [likedPosts, setLikedPosts] = React.useState([]);
  const [savedPosts, setSavedPosts] = React.useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    // Retrieve the user information from local storage
    const user = JSON.parse(localStorage.getItem("user"));
    setLoggedInUser(user);
  }, []);

  const handleMenuOpen = (event, postId) => {
    setAnchorEl(event.currentTarget);
    setSelectedPostId(postId);
  };
  //Handle menu
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPostId(null);
    setEditPostContent("");
    setEditingStates((prevState) => ({
      ...prevState,
      [selectedPostId]: false,
    }));
  };

  const handleEditPost = async () => {
    try {
      if (selectedPostId) {
        await axios.patch(
          `http://localhost:8000/merny/api/v1/auth/updatePost/${selectedPostId}`,
          {
            content: editPostContent,
          },
          {
            headers: {
              "x-auth-token": window.localStorage.getItem("x-auth-token"),
            },
          }
        );

        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p._id === selectedPostId ? { ...p, content: editPostContent } : p
          )
        );

        handleMenuClose();
      }
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleRemovePost = async () => {
    try {
      if (selectedPostId) {
        await axios.delete(
          `http://localhost:8000/merny/api/v1/auth/deletePost/${selectedPostId}`,
          {
            headers: {
              "x-auth-token": window.localStorage.getItem("x-auth-token"),
            },
          }
        );

        setPosts((prevPosts) =>
          prevPosts.filter((p) => p._id !== selectedPostId)
        );

        handleMenuClose();
      }
    } catch (error) {
      console.error("Error removing post:", error);
    }
  };

  const handleCopyLink = () => {
    try {
      if (selectedPostId) {
        const postUrl = `http://localhost:3000/${selectedPostId}`;

        navigator.clipboard.writeText(postUrl).then(() => {
          console.log("Post URL copied to clipboard:", postUrl);
        });

        handleMenuClose();
      }
    } catch (error) {
      console.error("Error copying link:", error);
    }
  };
  //handle like
  const handleToggleLike = async (postId) => {
    try {
      if (likedPosts.includes(postId)) {
        // If post is already liked, dislike it
        await axios.patch(
          `http://localhost:8000/merny/api/v1/auth/dislikePost/${postId}`,
          {},
          {
            headers: {
              "x-auth-token": window.localStorage.getItem("x-auth-token"),
            },
          }
        );
        setLikedPosts((prevLikedPosts) =>
          prevLikedPosts.filter((id) => id !== postId)
        );
      } else {
        // If post is not liked, like it
        await axios.patch(
          `http://localhost:8000/merny/api/v1/auth/likePost/${postId}`,
          {},
          {
            headers: {
              "x-auth-token": window.localStorage.getItem("x-auth-token"),
            },
          }
        );
        setLikedPosts((prevLikedPosts) => [...prevLikedPosts, postId]);

        // Create a notification for the post owner
        await axios.post(
          "http://localhost:8000/merny/api/v1/auth/notification/create",
          {
            recipients: [posts.user], // Array of recipient IDs
            text: `${loggedInUser.user} liked your post.`,
          },
          {
            headers: {
              "x-auth-token": window.localStorage.getItem("x-auth-token"),
            },
          }
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  React.useEffect(() => {
    const fetchPosts = async () => {
      const token = window.localStorage.getItem("x-auth-token");

      try {
        const generalResponse = await axios.get(
          "http://localhost:8000/merny/api/v1/auth/getPost",
          {
            headers: {
              "x-auth-token": token,
            },
          }
        );

        const followingResponse = await axios.get(
          "http://localhost:8000/merny/api/v1/auth/followingPosts",
          {
            headers: {
              "x-auth-token": token,
            },
          }
        );

        if (
          Array.isArray(generalResponse.data.posts) &&
          Array.isArray(followingResponse.data.posts)
        ) {
          setPosts([
            ...generalResponse.data.posts,
            ...followingResponse.data.posts,
          ]);

          const initialEditingStates = {};
          [
            ...generalResponse.data.posts,
            ...followingResponse.data.posts,
          ].forEach((post) => {
            initialEditingStates[post._id] = false;
          });
          setEditingStates(initialEditingStates);
        } else {
          console.error(
            "Invalid data structure in posts:",
            generalResponse.data,
            followingResponse.data
          );
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  const handleToggleSave = async (postId) => {
    try {
      const authToken = window.localStorage.getItem("x-auth-token");

      if (!authToken) {
        console.error("No authentication token available.");
        // Handle the case where there is no authentication token
        return;
      }

      if (savedPosts.includes(postId)) {
        // If post is already saved, unsave it
        await axios.patch(
          `http://localhost:8000/merny/api/v1/auth/unSavePost/${postId}`,
          {},
          {
            headers: {
              "x-auth-token": authToken,
            },
          }
        );
        setSavedPosts((prevSavedPosts) =>
          prevSavedPosts.filter((id) => id !== postId)
        );
      } else {
        // If post is not saved, save it
        await axios.patch(
          `http://localhost:8000/merny/api/v1/auth/savePost/${postId}`,
          {},
          {
            headers: {
              "x-auth-token": authToken,
            },
          }
        );
        setSavedPosts((prevSavedPosts) => [...prevSavedPosts, postId]);
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  return (
    <>
      {posts.map((post) => (
        <Card
          key={post._id}
          data-postid={post._id}
          sx={{ maxWidth: "98%", marginLeft: "15px", marginTop: "15px" }}
        >
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                {post.user.fullName.charAt(0)}
              </Avatar>
            }
            action={
              <div>
                <IconButton
                  aria-label="settings"
                  onClick={(event) => handleMenuOpen(event, post._id)}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  {editingStates[post._id] ? (
                    <>
                      <MenuItem sx={{ fontSize: "14px" }}>
                        <textarea
                          value={editPostContent}
                          onChange={(e) => setEditPostContent(e.target.value)}
                          placeholder="Edit post..."
                          rows="4"
                          cols="50"
                        />
                      </MenuItem>
                      <MenuItem
                        onClick={handleEditPost}
                        sx={{ fontSize: "14px" }}
                      >
                        <EditIcon sx={{ fontSize: "1rem" }} /> Save Changes
                      </MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem
                        onClick={() => {
                          setEditPostContent(post.content);
                          setEditingStates((prevState) => ({
                            ...prevState,
                            [post._id]: true,
                          }));
                        }}
                        sx={{ fontSize: "14px" }}
                      >
                        <EditIcon sx={{ fontSize: "1rem" }} /> Edit post
                      </MenuItem>
                      <MenuItem
                        onClick={handleRemovePost}
                        sx={{ fontSize: "14px" }}
                      >
                        <DeleteIcon sx={{ fontSize: "1rem" }} /> Remove post
                      </MenuItem>
                      <MenuItem
                        onClick={handleCopyLink}
                        sx={{ fontSize: "14px" }}
                      >
                        <ContentCopyIcon sx={{ fontSize: "1rem" }} /> Copy link
                      </MenuItem>
                    </>
                  )}
                </Menu>
              </div>
            }
            title={post.user.fullName}
            subheader={new Date(post.createdAt).toLocaleDateString()}
          />
          <CardMedia
            component="img"
            height="194"
            image={post.images}
            alt="Post"
          />

          <CardContent>
            <Typography variant="body2" color="text.secondary">
              {post.content}
            </Typography>
          </CardContent>
          <CardActions disableSpacing>
            <IconButton
              aria-label="add to favorites"
              sx={{
                width: "30px",
                color: likedPosts.includes(post._id) ? "gray" : "#d32f2f",
              }}
              onClick={() => handleToggleLike(post._id)}
            >
              <FavoriteIcon />
            </IconButton>

            <IconButton sx={{ width: "30px" }}>
              <FontAwesomeIcon icon={faComment} />
            </IconButton>
            <IconButton aria-label="share" sx={{ width: "30px" }}>
              <SendIcon />
            </IconButton>
            <IconButton
              sx={{
                position: "relative",
                left: "731px",
                width: "30px",
                marginLeft: "20px",
                color: savedPosts.includes(post._id) ? "#1ec995" : "inherit",
              }}
              onClick={() => handleToggleSave(post._id)}
            >
              <BookmarkBorderIcon
                sx={{
                  color: savedPosts.includes(post._id) ? "#1ec995" : "inherit",
                }}
              />
            </IconButton>
          </CardActions>
          <div className="post_status">
            <div>
              <p
                style={{
                  fontSize: "12px",
                  marginLeft: "15px",
                  fontWeight: "bold",
                  marginTop: "-10px",
                }}
              >
                {post.likes.length} likes
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  marginRight: "10px",
                }}
              >
                {post.comments.length} comments
              </p>
            </div>
          </div>
          <Collapse timeout="auto" unmountOnExit>
            <CardContent>
              <Typography paragraph>Method:</Typography>
              <Typography paragraph>
                {/* Add dynamic content if needed */}
              </Typography>
            </CardContent>
          </Collapse>
          <CommentSkeleton postId={post._id} postUserId={post.user._id} />
        </Card>
      ))}
    </>
  );
}
