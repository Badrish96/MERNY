import React, { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./register.css";
import { Typography } from "@mui/material";
import {
  registerStart,
  registerSuccess,
  registerFailure,
} from "../../Slice/AuthSlice";
import { jwtDecode } from "jwt-decode";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState(""); // Initialize gender state

  const handleFullNameChange = (e) => {
    setFullName(e.target.value);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleGenderChange = (e) => {
    setGender(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(registerStart(fullName, username, email, password, gender));

    try {
      const response = await axios.post(
        "http://localhost:8000/merny/api/v1/auth/register",
        {
          fullName,
          username,
          email,
          password,
          gender, // Ensure gender is correctly set in the request payload
        }
      );

      const { accessToken } = response.data;
      const decodedToken = jwtDecode(accessToken);

      console.log(decodedToken);

      // Save the token to the session storage or local storage
      sessionStorage.setItem("token", accessToken);

      dispatch(registerSuccess(response.data));
      navigate("/"); // Redirect to login page after successful registration
    } catch (error) {
      dispatch(
        registerFailure(error.response?.data?.message || "Registration failed")
      );
      console.log(error);
    }
  };

  const handleLoginClick = () => {
    navigate("/"); // Redirect to the login page
  };
  return (
    <>
      <div className="register">
        <form className="registerForm" onSubmit={handleSubmit}>
          <Typography
            variant="h3"
            style={{
              width: "100%",
              fontWeight: "bold",
              textAlign: "center",
              fontSize: "25px",
            }}
          >
            MERNY
          </Typography>
          <Typography
            style={{ width: "100%", marginTop: "10px", fontSize: "14px" }}
          >
            Full Name
          </Typography>
          <input
            type="text"
            value={fullName}
            onChange={handleFullNameChange}
            autoComplete="full-name"
          />
          <Typography
            style={{ width: "100%", marginTop: "10px", fontSize: "14px" }}
          >
            User Name
          </Typography>
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            autoComplete="username"
          />
          <Typography
            style={{ width: "100%", marginTop: "10px", fontSize: "14px" }}
          >
            Email Address
          </Typography>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            autoComplete="username"
          />
          <Typography
            style={{ width: "100%", marginTop: "10px", fontSize: "14px" }}
          >
            Password
          </Typography>
          <input
            type="password"
            autoComplete="off"
            value={password}
            onChange={handlePasswordChange}
          />
          <Typography
            style={{ width: "100%", marginTop: "10px", fontSize: "14px" }}
          >
            Confirm Password
          </Typography>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            autoComplete="off"
          />
          <div className="radio_buttons">
            <div>
              <p>Male:</p>
              <input
                type="radio"
                name="gender"
                value="Male"
                onChange={handleGenderChange}
              />
            </div>
            <div>
              <p>Female:</p>
              <input
                type="radio"
                name="gender"
                value="Female"
                onChange={handleGenderChange}
              />
            </div>
            <div>
              <p>Other:</p>
              <input
                type="radio"
                name="gender"
                value="Other"
                onChange={handleGenderChange}
              />
            </div>
          </div>
          <button type="submit">Register</button>
          <Typography
            style={{ marginTop: "10px", cursor: "pointer", fontSize: "14px" }}
            onClick={handleLoginClick}
          >
            Already have an account? Login Now
          </Typography>
        </form>
      </div>
    </>
  );
}
