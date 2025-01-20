import React, { useState, useEffect, createContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import "../utilities.css";
import { socket } from "../client-socket";
import { get, post } from "../utilities";
export const UserContext = createContext(null);

const App = () => {
  const [userId, setUserId] = useState(undefined);
  const [decoded, setDecoded] = useState(() => {
    const tokenSaved = localStorage.getItem("decodedToken");
    return tokenSaved ? JSON.parse(tokenSaved) : null;
  });
  const navigate = useNavigate();

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
  }, [userId]);

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
    <UserContext.Provider value={authContextValue}>
      <Outlet />
    </UserContext.Provider>
  );
};

export default App;