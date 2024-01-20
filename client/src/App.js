import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux"; // Add this import
import HomePage from "./pages/HomePage/HomePage.jsx";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx"; // Import the Register component
import Profile from "./components/Profile/Profile.jsx";
import UserProfile from "./components/UserProfile/UserProfile.jsx";
function App() {
  const user = useSelector((state) => state.auth.user); // Get user state from Redux store
  const isLoggedIn = window.localStorage.getItem("loggedIn"); // Check as a boolean
  return (
    <div className="App">
      <BrowserRouter>
        {/* <Profile /> */}
        <Routes>
          {/* Route to Login page */}
          <Route
            path="/"
            element={isLoggedIn === "true" ? <HomePage /> : <Login />}
          />

          {/* Route to Home page */}
          <Route
            path="/home"
            element={user ? <HomePage /> : <Navigate to="/" />}
          />

          {/* Route to Register page */}
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:username" element={<UserProfile />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
