
const BASE_URL = process.env.NODE_ENV === "production"
  ? "https://find-the-moles.onrender.com/api"
  : "http://localhost:10000/api";

/**
 * Helper function for POST requests with credentials included.
 */
const post = async (endpoint, data) => {
  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include", // IMPORTANT: Include cookies
    });

    const resData = await response.json();

    if (!response.ok) {
      throw new Error(resData.error || resData.message || "POST request failed");
    }

    return resData;
  } catch (error) {
    console.error(`Error in POST ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Helper function for GET requests with credentials included.
 */
const get = async (endpoint, params = {}) => {
  try {
    const url = new URL(`${BASE_URL}/${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url, {
      method: "GET",
      credentials: "include", // IMPORTANT: Include cookies
    });

    const resData = await response.json();

    if (!response.ok) {
      throw new Error(resData.error || resData.message || "GET request failed");
    }

    return resData;
  } catch (error) {
    console.error(`Error in GET ${endpoint}:`, error);
    throw error;
  }
};

// Exported API functions

export const setNickname = async (userId, nickname) => {
  return await post("user/setNickname", { userId, nickname });
};

export const createLobby = async (hostNickname) => {
  const data = await post("lobby/create", { host_id: hostNickname });
  return data.lobby;
};

export const joinLobby = async (lobbyCode, userNickname) => {
  const data = await post("lobby/join", { lobbyCode, user_id: userNickname });
  return data.lobby;
};

export const leaveLobby = async (lobbyCode, userNickname) => {
  const data = await post("lobby/leave", { lobbyCode, user_id: userNickname });
  return data;
};

export const createGame = async (lobbyCode, user_id) => {
  const data = await post(`lobby/${lobbyCode}/createGame`, { user_id });
  return data;
};

// Add other API functions as needed, following the same pattern.
