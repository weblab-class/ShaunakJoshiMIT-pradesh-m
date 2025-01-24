import React, { useState, useEffect, createContext, useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import "../utilities.css";
import { get, post } from "../utilities";
import { SocketContext } from "./modules/SocketContext.jsx";
import { AudioProvider } from "./modules/AudioContext";

export const UserContext = createContext(null);

const App = () => {
  const [userId, setUserId] = useState(undefined);
  const [decoded, setDecoded] = useState(() => {
    const tokenSaved = localStorage.getItem("decodedToken");
    return tokenSaved ? JSON.parse(tokenSaved) : null;
  });
  const navigate = useNavigate();
  const socket = useContext(SocketContext);

  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user._id) {
        setUserId(user._id);
        setDecoded((prev) => ({ ...prev, nickname: user.nickname }));
      }
    });
  }, []);

  useEffect(() => {
    if (userId) {
      socket.emit("initUser", userId);
    }
  }, [userId, socket]);

  const handleLogin = (credentialResponse) => {
    const userToken = credentialResponse.credential;
    const decodedCredential = jwt_decode(userToken);
    localStorage.setItem("decodedToken", JSON.stringify(decodedCredential));
    console.log(`Logged in as ${decodedCredential.name}`);

    post("/api/login", { token: userToken })
      .then((user) => {
        console.log("Server responded with user:", user._id);
        setUserId(user._id);
        setDecoded((prev) => ({ ...prev, nickname: user.nickname }));
        post("/api/initsocket", { socketid: socket.id });
        navigate("/home");
      })
      .catch((error) => {
        console.error("Error during /api/login:", error);
      });
  };

  const handleLogout = () => {
    setUserId(undefined);
    localStorage.removeItem("decodedToken");
    post("/api/logout");
    navigate("/");
  };

  const googleid = decoded?.sub || null;

  const authContextValue = {
    userId,
    googleid,
    handleLogin,
    handleLogout,
    decoded,
  };

  return (
    <AudioProvider>
      <UserContext.Provider value={authContextValue}>
        <Outlet />
      </UserContext.Provider>
    </AudioProvider>
  );
};

export default App;
