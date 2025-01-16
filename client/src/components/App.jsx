import React, { useState, useEffect, createContext } from "react";
import { Outlet } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "../utilities.css";
import { socket } from "../client-socket";
import { get, post } from "../utilities";
export const UserContext = createContext(null);



/**
 * Define the "App" component
 */
const App = () => {
  const [userId, setUserId] = useState(undefined);
  const [decoded, setDecoded] = useState(() => {

    const tokenSaved = localStorage.getItem("decodedToken");
    return (tokenSaved) ? JSON.parse(tokenSaved) : null;


  })
  const navigate = useNavigate();

  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user._id) {
        // they are registed in the database, and currently logged in.
        setUserId(user._id);

      }
    });
  }, []);

  const addNewUser = () => {
    return null

  }




  const handleLogin = (credentialResponse) => {
    const userToken = credentialResponse.credential;
    const decodedCredential = jwt_decode(userToken);

    localStorage.setItem("decodedToken", JSON.stringify(decodedCredential));


    console.log(`Logged in as ${decodedCredential.name}`);

    post("/api/login", { token: userToken })
    .then((user) => {
      console.log("Server responded with user:", user._id);
      setUserId(user._id);

      get("/api/user", { userid: user._id }).then((userObj) => {
        console.log(userObj, " testing userobj")
        if (userObj === null) {
          const body = {
            name: decodedCredential.name,
            username: decodedCredential.name,
            googleid: user._id,
            friends: []
          }
          post("/api/addUser", body).then((userObj) => {
            console.log(`Added user ${userObj.name}`)
          })
        }
      })

      post("/api/initsocket", { socketid: socket.id });
      navigate("/home")
    })
    .catch((error) => {
      console.error("Error during /api/login:", error);
    });
  };

  const handleLogout = () => {
    setUserId(undefined);
    post("/api/logout");
    navigate("/")
  };

  const authContextValue = {
    userId,
    handleLogin,
    handleLogout,
    decoded,
  };

  return (
    <>
    <UserContext.Provider value={authContextValue}>
      <Outlet />
    </UserContext.Provider>
    </>
  );
};

export default App;
