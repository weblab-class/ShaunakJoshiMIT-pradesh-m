import React, { useContext } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { UserContext } from "../App";

const LoginLogoutButton = () => {
  const { userId, handleLogin, handleLogout } = useContext(UserContext);

  const onLogoutClick = () => {
    googleLogout();
    handleLogout();
  };

  return (
    <>
      {userId ? (
        <button onClick={onLogoutClick}>Logout</button>
      ) : (
        <GoogleLogin
          onSuccess={handleLogin}
          onError={(err) => console.error("Login Failed:", err)}
        />
      )}
    </>
  );
};

export default LoginLogoutButton;
