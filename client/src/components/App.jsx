// src/components/App.jsx
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { get, post } from "../utilities";
import { UserContext } from "./contexts/UserContext";

const App = () => {
  const [userId, setUserId] = useState(null);

  // Check login status on mount
  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user._id) {
        setUserId(user._id);
      }
    });
  }, []);

<<<<<<< HEAD
  const handleLogin = (credentialResponse) => {
    const userToken = credentialResponse.credential;
    const decodedCredential = jwt_decode(userToken);
    console.log(`Logged in as ${decodedCredential.name}`);
    post("/api/login", { token: userToken })
    .then((user) => {
      console.log("Server responded with user:", user._id);
      setUserId(user._id);
      post("/api/initsocket", { socketid: socket.id });
    })
    .catch((error) => {
      console.error("Error during /api/login:", error);
=======
  // Called on GoogleLogin success
  const handleLogin = (googleResponse) => {
    console.log("Google login credential response:", googleResponse);

    // The server only needs the 'credential' field:
    const userToken = googleResponse.credential;
    post("/api/login", { token: userToken }).then((user) => {
      console.log("Server returned user:", user);
      setUserId(user._id);
>>>>>>> 3801231bc15a9c218663fd62681b75cce11c6790
    });
  
  };

  // Called when user logs out
  const handleLogout = () => {
    console.log("Logging out...");
    post("/api/logout");
    setUserId(null);
  };

  return (
    <UserContext.Provider value={userId}>
      {/* The Outlet renders whichever route is active */}
      <Outlet context={{ handleLogin, handleLogout }} />
    </UserContext.Provider>
  );
};

export default App;
