import React from "react";
import Terminal from "../modules/terminal";
import Layout from '../layout.jsx';

const ProfilePage = () => {
  return (
    <Layout currentPage="profile">
      <h1>Profile Page</h1>
      <p>Welcome to your profile!</p>
      <Terminal username="shaunakj" />
    </Layout>
  );
};

export default ProfilePage;
