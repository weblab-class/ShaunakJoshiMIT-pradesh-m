import React, { useContext } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import "../../utilities.css";
import { UserContext } from "../App.jsx";
import "../styles/HomePage.css"; 
import Layout from '../layout.jsx';


const HomePage = () => {
  const { userId, handleLogin, handleLogout } = useContext(UserContext);
  return (
  <Layout currentPage = "home">
  <div className="homepage">
  {userId ? (
        <button
          onClick={() => {
            googleLogout();
            handleLogout();
          }}
        >
          Logout
        </button>
      ) : (
        <GoogleLogin onSuccess={handleLogin} onError={(err) => console.log(err)} />
      )}

      <div>
        <h1>Welcome to the Find the Moles!</h1>
        <p>Navigate through the maze, solve trivia, and find the FBI imposter!</p>
      </div>
    </div>
    </Layout>
  );
};

export default HomePage;
