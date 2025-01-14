import React from "react";
import { useParams } from "react-router-dom";
import Layout from "../layout";

const LobbyPage = () => {
  const { lobbyCode } = useParams();

  return (
    <Layout>
      <h1>Welcome to Lobby: {lobbyCode}</h1>
    </Layout>
  );
};

export default LobbyPage;
