const BASE_URL = "http://localhost:3000/api";

export const setNickname = async (googleid, nickname) => {
  try {
    const response = await fetch(`${BASE_URL}/user/setNickname`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ googleid, nickname })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to set nickname");
    }
    return data;
  } catch (error) {
    console.error("Error in setNickname:", error);
    throw error;
  }
};

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