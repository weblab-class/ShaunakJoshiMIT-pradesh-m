import React from "react";
import { useParams } from "react-router-dom";

const LobbyPage = () => {
  const { lobbyCode } = useParams();
  return (
    <div>
      <h1>Welcome to Lobby: {lobbyCode}</h1>
    </div>
  );
};

export default LobbyPage;
