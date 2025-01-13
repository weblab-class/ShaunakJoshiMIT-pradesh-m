import React, { useContext } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { UserContext } from "../App.jsx";

const LoginLogoutButton = () => {
  const { userId, handleLogin, handleLogout } = useContext(UserContext);


  const login = useGoogleLogin({
    onSuccess: handleLogin,
    onError: (err) => console.error("Login failed:", err),
  });

  return userId ? (
    <button onClick={() => { googleLogout(); handleLogout(); }}>
      Logout
    </button>
  ) : (
    <button onClick={() => login()}>
      Login
    </button>
  );
  
};

export default LoginLogoutButton;
