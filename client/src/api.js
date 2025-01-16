const BASE_URL = "http://localhost:3000/api";

export const createLobby = async (hostId) => {
  try {
    const response = await fetch(`${BASE_URL}/lobby/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host_id: hostId }),
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

export const joinLobby = async (lobbyCode, userId) => {
  try {
    const response = await fetch(`${BASE_URL}/lobby/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lobbyCode, user_id: userId }),
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

export const leaveLobby = async (lobbyCode, userId) => {
  try {
    const response = await fetch(`${BASE_URL}/lobby/leave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lobbyCode, user_id: userId }),
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
