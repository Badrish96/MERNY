import React, { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { loginStart, loginSuccess, loginFailure } from "../../Slice/AuthSlice";
import "./login.css";
import { Typography } from "@mui/material";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart(email, password));

    try {
      const response = await axios.post(
        "http://localhost:8000/merny/api/v1/auth/login",
        {
          email,
          password,
        }
      );

      const { accessToken } = response.data;
      const decodedToken = jwtDecode(accessToken);
      console.log(decodedToken);

      window.localStorage.setItem("x-auth-token", accessToken);
      window.localStorage.setItem("loggedIn", true);
      window.localStorage.setItem(
        "user",
        JSON.stringify({ user: decodedToken.user })
      );

      dispatch(loginSuccess(response.data));
      navigate("/home");
    } catch (error) {
      dispatch(loginFailure(error.response?.data?.message || "Login failed"));
      console.log(error);
    }
  };

  const handleRegisterClick = () => {
    // Navigate to the Register page when "Register Now" is clicked
    navigate("/register");
  };

  return (
    <div className="login">
      <form className="loginForm" onSubmit={handleSubmit}>
        <Typography
          variant="h3"
          style={{ padding: "1vmax", fontWeight: "bold", fontSize: "2rem" }}
        >
          MERNY
        </Typography>
        <Typography style={{ width: "100%", fontSize: "14px" }}>
          Email Address
        </Typography>
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          autoComplete={"username"}
        />
        <Typography style={{ width: "100%", fontSize: "14px" }}>
          Password
        </Typography>
        <input
          type="password"
          value={password}
          onChange={handlePasswordChange}
          autoComplete="current-password"
        />
        <button type="submit">Login</button>
        <Typography
          style={{ marginTop: "10px" }}
          sx={{ cursor: "pointer", fontSize: "14px" }}
          onClick={handleRegisterClick}
        >
          Don't have an account? Register Now
        </Typography>
      </form>
    </div>
  );
}
