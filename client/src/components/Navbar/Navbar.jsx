import React, { useState, useEffect } from "react";
import axios from "axios";
import { styled } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Badge from "@mui/material/Badge";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MoreIcon from "@mui/icons-material/MoreVert";
import Popover from "@mui/material/Popover";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import ListItemIcon from "@mui/material/ListItemIcon";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import Avatar from "@mui/material/Avatar";
import "./navbar.css";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

export default function PrimarySearchAppBar() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Modify delayedFetchUserSuggestions to use the functional form of set state
  const delayedFetchUserSuggestions = debounce(async () => {
    const authToken = window.localStorage.getItem("x-auth-token");

    try {
      const response = await axios.get(
        `http://localhost:8000/merny/api/v1/auth/userSuggestions?searchTerm=${searchQuery}`,
        {
          headers: {
            "x-auth-token": authToken,
          },
        }
      );

      // Use the functional form of setUserSuggestions to access previous state
      setUserSuggestions((prevSuggestions) => {
        // Check if the new value is different from the previous state
        if (
          JSON.stringify(prevSuggestions) !==
          JSON.stringify(response.data.users)
        ) {
          return response.data.users;
        }
        // If the values are the same, return the previous state
        return prevSuggestions;
      });
    } catch (error) {
      console.error("Error fetching user suggestions:", error);
    }
  }, 300);

  useEffect(() => {
    if (searchQuery.trim() !== "") {
      delayedFetchUserSuggestions();
    } else {
      setUserSuggestions(false); // Clear suggestions if the search query is empty
    }

    // Cleanup function to clear the debounce timer
    return () => delayedFetchUserSuggestions.cancel();
  }, [searchQuery, delayedFetchUserSuggestions]);

  const handleLogout = () => {
    // Clear authentication-related items from local storage
    window.localStorage.removeItem("x-auth-token");
    window.localStorage.removeItem("loggedIn");
    window.localStorage.removeItem("user");

    // Navigate to the login page
    navigate("/");
  };

  const open = Boolean(anchorEl);
  const notificationOpen = Boolean(notificationAnchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleHomePageClick = () => {
    navigate("/home");
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/merny/api/v1/auth/notification/find",
          {
            headers: {
              "x-auth-token": window.localStorage.getItem("x-auth-token"),
            },
          }
        );

        setNotifications(response.data.notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  const handleUserProfileClick = (user) => {
    console.log("Clicked User:", user);
    // Pass the selected user details to the UserProfile component
    navigate(`/user/${user.username}`, { state: { user } });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              display: {
                xs: "none",
                sm: "block",
                fontSize: "24px",
                fontWeight: "bold",
                cursor: "pointer",
              },
            }}
            onClick={handleHomePageClick}
          >
            MERNY
          </Typography>
          <Search
            sx={{
              backgroundColor: "white",
              color: "black",
              borderRadius: "20px",
            }}
          >
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Enter to Search"
              inputProps={{ "aria-label": "search" }}
              sx={{
                backgroundColor: "white",
                color: "black",
                marginLeft: "400px",
                borderRadius: "20px",
              }}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {userSuggestions.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  backgroundColor: "white",
                  boxShadow: "0px 8px 16px 0px rgba(0,0,0,0.2)",
                  zIndex: 1,
                  width: "200px",
                  marginTop: "8px",
                }}
              >
                {userSuggestions.map((user) => (
                  <div
                    key={user._id}
                    style={{ padding: "8px", cursor: "pointer" }}
                  >
                    <span
                      onClick={() => handleUserProfileClick(user)}
                      style={{
                        display: "flex",
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      <Avatar sx={{ bgcolor: "red[500]" }} aria-label="recipe">
                        {user.fullName.charAt(0)}
                      </Avatar>
                      <p style={{ marginTop: "5px", marginLeft: "5px" }}>
                        {user.fullName}
                      </p>
                    </span>
                    <Link to={`/user/${user.username}`}></Link>
                  </div>
                ))}
              </div>
            )}
          </Search>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <IconButton
              color="inherit"
              sx={{ width: "30px", marginRight: "10px" }}
              onClick={handleHomePageClick}
            >
              <HomeIcon sx={{ fontSize: 30, padding: "0px" }} />
            </IconButton>
            <IconButton
              size="large"
              aria-label="show 4 new mails"
              color="inherit"
              sx={{ width: "30px", marginRight: "10px" }}
            >
              <Badge badgeContent={4} color="error">
                <MailIcon sx={{ color: "white", padding: "0px" }} />
              </Badge>
            </IconButton>
            <IconButton
              size="large"
              aria-label="show 17 new notifications"
              color="inherit"
              onClick={handleNotificationClick}
              sx={{ width: "30px", marginRight: "10px" }}
            >
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon sx={{ color: "white", padding: "0px" }} />
              </Badge>
            </IconButton>
            <Popover
              id="notification-appbar"
              anchorEl={notificationAnchorEl}
              open={notificationOpen}
              onClose={handleNotificationClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <Box p={2} display="flex" alignItems="center" width="300px">
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Notifications
                </Typography>
              </Box>
              {notifications.map((notification) => (
                <Box
                  key={notification.id}
                  p={2}
                  display="flex"
                  alignItems="center"
                  onClick={() => {
                    // Handle notification click, e.g., redirect to the relevant page
                    console.log("Notification clicked:", notification);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <Avatar
                    alt="Dummy Profile Picture"
                    src="/path_to_your_dummy_image.jpg"
                    sx={{
                      width: 50,
                      height: 50,
                      marginRight: 2,
                      backgroundColor: "orange",
                    }}
                    className="notification_pic"
                  >
                    {notification.text.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      className="notification_text"
                    >
                      {notification.text}
                    </Typography>
                    {/* Additional content */}
                  </Box>
                </Box>
              ))}
            </Popover>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleClick}
              color="inherit"
              sx={{ width: "30px" }}
            >
              <AccountCircle sx={{ color: "white" }} />
            </IconButton>
            <Popover
              id="menu-appbar"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuList>
                <MenuItem onClick={handleProfileClick}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <ExitToAppIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </MenuList>
            </Popover>
          </Box>
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-haspopup="true"
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
