const BASE_URL = "http://localhost:3000/api";

export const setNickname = async (userId, nickname) => {
  try {
    const response = await fetch(`${BASE_URL}/user/setNickname`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Send the internal userId
      body: JSON.stringify({ userId, nickname }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to set nickname");
    }
    return data; // Expecting { message, nickname } on success
  } catch (error) {
    console.error("Error in setNickname:", error);
    throw error;
  }
};

// ... Other functions (createLobby, joinLobby, leaveLobby, createGame) remain unchanged.

export const createLobby = async (hostNickname) => {
  try {
    const response = await fetch(`${BASE_URL}/lobby/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host_id: hostNickname })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to create lobby");
    }
    return data.lobby;
  } catch (error) {
    console.error("Error in createLobby:", error);
    throw error;
  }
};

export const joinLobby = async (lobbyCode, userNickname) => {
  try {
    const response = await fetch(`${BASE_URL}/lobby/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lobbyCode, user_id: userNickname })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to join lobby");
    }
    return data.lobby;
  } catch (error) {
    console.error("Error joining lobby:", error);
    throw error;
  }
};

export const leaveLobby = async (lobbyCode, userNickname) => {
  try {
    const response = await fetch(`${BASE_URL}/lobby/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lobbyCode, user_id: userNickname })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to leave lobby");
    }
    return data;
  } catch (error) {
    console.error("Error leaving lobby:", error);
    throw error;
  }
};

export const createGame = async (lobbyCode, user_id) => {
  try {
    const response = await fetch(`${BASE_URL}/lobby/${lobbyCode}/createGame`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to create game.");
    }
    return data;
  } catch (error) {
    console.error("Error in createGame:", error);
    throw error;
  }
};
