import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TerminalContext } from "./TerminalContext";
import { get, post } from "../../utilities";
import {
  createLobby,
  joinLobby,
  leaveLobby,
  createGame,
} from "../../api.js";
import TerminalHeader from "./TerminalHeader";
import TerminalDisplay from "./TerminalDisplay";
import TerminalInput from "./TerminalInput";
import "../styles/Terminal.css";
import { UserContext } from "../App";
import { SocketContext } from "./SocketContext.jsx";
import { AudioContext } from "../modules/AudioContext";

function tokenizeCommand(command) {
  return command.trim().split(/\s+/);
}

const Terminal = () => {
  const { history, addHistory, clearHistory } = useContext(TerminalContext);
  const { userId, handleLogin, handleLogout, decoded } = useContext(UserContext);
  const socket = useContext(SocketContext);
  const { playDing } = useContext(AudioContext);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const defaultUsername = decoded?.name || userId || "anonymous";

  useEffect(() => {
    if (userId) {
      get("/api/user", { userid: userId })
        .then((userObj) => {
          setUser(userObj);
        })
        .catch((err) => {
          console.error("User Not Found");
        });
    }
  }, [userId]);

  const getNickname = () => (user?.nickname ? user.nickname : "anonymous");

  const executeCommand = async (command) => {
    const tokens = tokenizeCommand(command);
    const primary = tokens[0]?.toLowerCase();

    const pathParts = window.location.pathname.split("/");
    const lobbyCode = pathParts[2]; // e.g. /lobby/XXXX => 'XXXX'

    switch (primary) {
      case "cd":
        switch (tokens[1]?.toLowerCase()) {
          case "profile":
            navigate("/profile");
            playDing();
            return "Navigating to the profile page";
          case "home":
            navigate("/home");
            playDing();
            return "Navigating to the home page";
          case "friends":
            navigate("/friends");
            playDing();
            return "Navigating to the friends page";
          case "settings":
            navigate("/settings");
            playDing();
            return "Navigating to the settings page";
          case "rules":
            navigate("/rules");
            playDing();
            return "Navigating to the login page";
          default:
            return "Command does not exist";
        }

      case "create":
        if (tokens[1]?.toLowerCase() === "lobby") {
          const nickname = getNickname();
          if (!nickname)
            return "Please set your nickname first with: nickname <your nickname>";
          try {
            const lobby = await createLobby(nickname);
            navigate(`/lobby/${lobby.lobbyCode}`);
            playDing();
            return `Lobby created: ${lobby.lobbyCode}. Navigating to the lobby.`;
          } catch (error) {
            return `Failed to create lobby: ${error.message}`;
          }
        }
        if (tokens[1]?.toLowerCase() === "game") {
          const pathParts = window.location.pathname.split("/");
          const lobbyCode = pathParts[2];
          if (!lobbyCode) {
            return "You are not currently in a lobby.";
          }
          const host_id = getNickname();
          try {
            const response = await createGame(lobbyCode, host_id);
            playDing();
            return "Game created. Navigating to the game page.";
          } catch (error) {
            return `Failed to create game: ${error.message}`;
          }
        }
        return "Invalid create command. Try 'create lobby' or 'create game'.";

      case "appoint":
        if (tokens.length > 2) {
          return "Invalid appoint command. Usage: appoint <nickname>";
        }
        const appointee = tokens[1];
        if (!lobbyCode) {
          return "You are not currently in a lobby.";
        }
        try {
          const response = await post("/api/game/appoint", {
            user_id: userId,
            lobbyCode: lobbyCode,
            appointee: appointee,
          });
          return `Successfully appointed ${appointee} as the hacker.`;
        } catch (error) {
          return `Failed to appoint: ${error.message}`;
        }

      case "move":
        if (tokens.length !== 2) {
          return "Invalid move command. Usage: move <direction>";
        }
        const targetNode = tokens[1].toLowerCase();
        if (!lobbyCode) {
          return "You are not currently in a lobby.";
        }
        try {
          const response = await post("/api/game/move", {
            user_id: userId,
            lobbyCode: lobbyCode,
            targetNode: targetNode,
          });
          return `Proposed move to ${targetNode}.`;
        } catch (error) {
          return `Failed to move: ${error.message}`;
        }

      case "vote":
        if (tokens.length !== 2) {
          return "Invalid vote command. Usage: vote <yes|no>";
        }
        const decision = tokens[1].toLowerCase();
        if (!["yes", "no"].includes(decision)) {
          return "Invalid vote. Please use 'yes' or 'no'.";
        }
        if (!lobbyCode) {
          return "You are not currently in a lobby.";
        }
        try {
          const response = await post("/api/game/vote", {
            user_id: userId,
            lobbyCode,
            decision,
          });
          return `Your vote has been cast: ${decision}.`;
        } catch (error) {
          return `Failed to cast vote: ${error.message}`;
        }

      case "answer":
        if (tokens.length !== 2) {
          return "Invalid answer command. Usage: answer <answer>";
        }
        const answer = tokens[1].toLowerCase();
        if (!lobbyCode) {
          return "You are not currently in a lobby.";
        }
        try {
          const response = await post("/api/game/answer", {
            user_id: userId,
            lobbyCode,
            answer,
          });
          return `Your answer has been submitted: ${answer}.`;
        } catch (error) {
          return `Failed to submit answer: ${error.message}`;
        }

      case "role":
        if (tokens.length !== 1) {
          return "Invalid role command. Usage: role";
        }
        if (!lobbyCode) {
          return "You are not currently in a lobby.";
        }
        try {
          const response = await get("/api/game/role", { lobbyCode, user_id: userId });
          return `Your role is: ${response.role}.`;
        } catch (error) {
          return `Failed to get your role: ${error.message}`;
        }

      case "next":
        if (tokens.length !== 1) {
          return "Invalid next command. Usage: next";
        }
        if (!lobbyCode) {
          return "You are not currently in a lobby.";
        }
        try {
          const response = await post("/api/game/result", {
            lobbyCode,
            user_id: userId,
          });
          return `The game result is: ${response.result}.`;
        } catch (error) {
          return `Failed to get game result: ${error.message}`;
        }

      case "join":
        if (tokens[1]?.toLowerCase() === "lobby" && tokens.length === 3) {
          const joinCode = tokens[2].toUpperCase();
          const nickname = getNickname();
          if (!nickname)
            return "Please set your nickname first with: nickname <your nickname>";
          try {
            const lobby = await joinLobby(joinCode, nickname);
            navigate(`/lobby/${joinCode}`);
            playDing();
            return `Joined lobby: ${joinCode}. Navigating to the lobby.`;
          } catch (error) {
            return `Failed to join lobby: ${error.message}`;
          }
        }
        return "Invalid join command. Usage: join lobby <lobbyCode>";

      case "leave":
        if (tokens[1]?.toLowerCase() === "lobby" && tokens.length === 3) {
          const leaveCode = tokens[2].toUpperCase();
          const nickname = getNickname() || defaultUsername;
          try {
            const response = await leaveLobby(leaveCode, nickname);
            navigate("/home");
            playDing();
            return `Successfully left the lobby: ${leaveCode}. ${response.message}`;
          } catch (error) {
            return `Failed to leave lobby: ${error.message}`;
          }
        }
        return "Invalid leave command. Usage: leave lobby <lobbyCode>";

      case "nickname": {
        const newNick = tokens.slice(1).join(" ").trim();
        if (
          !newNick ||
          newNick.length > 16 ||
          newNick.length < 4 ||
          newNick.indexOf(" ") >= 0
        ) {
          return "Nickname must be between 4 and 16 characters and cannot have spaces. Usage: nickname <your-nickname>";
        }
        try {
          const response = await post("/api/user/setNickname", {
            userId: userId,
            nickname: newNick,
          });
          setUser((prevUser) => ({
            ...prevUser,
            nickname: newNick,
          }));
          playDing();
          return `Nickname set to: ${response.nickname}`;
        } catch (error) {
          console.error("Error setting nickname:", error);
          return "That nickname is already in use, please try again.";
        }
      }

      case "friend":
        switch (tokens[1]?.toLowerCase()) {
          case "request":
            if (tokens.length !== 3) {
              return "Invalid friend command. Usage: friend request <username>";
            }
            try {
              const reqNickName = tokens[2];
              await post("/api/requests/sendRequest", {
                from: userId,
                to: reqNickName,
              });
              playDing();
              return `Successfully sent a friend request to ${reqNickName}`;
            } catch (error) {
              return `Error sending friend request: ${error.message}`;
            }

          case "accept":
            if (tokens.length !== 3) {
              return "Invalid friend command. Usage: friend accept <username>";
            }
            try {
              const reqNickName = tokens[2];
              await post("/api/requests/sendRequest/accept", {
                from: reqNickName,
                to: userId,
              });
              playDing();
              return `Successfully accepted ${reqNickName}'s friend request.`;
            } catch (error) {
              return `Error accepting friend request: ${error.message}`;
            }

          case "reject":
            if (tokens.length !== 3) {
              return "Invalid friend command. Usage: friend reject <username>";
            }
            try {
              const reqNickName = tokens[2];
              await post("/api/requests/sendRequest/reject", {
                from: reqNickName,
                to: userId,
              });
              playDing();
              return `Successfully rejected ${reqNickName}'s friend request.`;
            } catch (error) {
              return `Error rejecting friend request: ${error.message}`;
            }

          default:
            return "Invalid friend subcommand. Try: friend request <username>";
        }

      // ---------------------------------------------------
      // NEW: "time" <minutes> => sets timeLimit in the lobby
      // ---------------------------------------------------
      case "time": {
        // usage: time <minutes>
        if (!lobbyCode) {
          return "You are not currently in a lobby.";
        }
        if (tokens.length !== 2) {
          return "Usage: time <minutes>";
        }
        const newTime = Number(tokens[1]);
        if (isNaN(newTime) || newTime < 1 || newTime > 60) {
          return "Invalid time limit. Must be an integer between 1 and 60.";
        }
        try {
          const response = await post("/api/lobby/updateSettings", {
            lobbyCode,
            userNickname: getNickname(),
            timeLimit: newTime,
          });
          playDing();
          return `Time limit updated to ${newTime} minute(s).`;
        } catch (error) {
          return `Failed to set time limit: ${error.message}`;
        }
      }

      // ---------------------------------------------------
      // NEW: "grid" <3|9> => sets gridSize in the lobby
      // ---------------------------------------------------
      case "grid": {
        // usage: grid <3|9>
        if (!lobbyCode) {
          return "You are not currently in a lobby.";
        }
        if (tokens.length !== 2) {
          return "Usage: grid <3|9>";
        }
        const g = Number(tokens[1]);
        if (![3, 9].includes(g)) {
          return "Grid size must be either 3 or 9.";
        }
        try {
          const response = await post("/api/lobby/updateSettings", {
            lobbyCode,
            userNickname: getNickname(),
            gridSize: g,
          });
          playDing();
          return `Grid size updated to ${g}x${g}.`;
        } catch (error) {
          return `Failed to set grid size: ${error.message}`;
        }
      }

      case "logout":
        handleLogout();
        playDing();
        return "Logging out";

      case "help":
        return (
          "\nAvailable commands:\n\n" +
          "  clear                   - Clears the terminal\n" +
          "  cd home                 - Navigate to home page\n" +
          "  cd profile              - Navigate to profile page\n" +
          "  cd friends              - Navigate to friends page\n" +
          "  cd settings             - Navigate to settings page\n" +
          "  nickname <your name>    - Set your nickname (4-16 chars, no spaces)\n" +
          "  create lobby            - Create a new lobby (requires nickname)\n" +
          "  join lobby <code>       - Join an existing lobby\n" +
          "  leave lobby <code>      - Leave the specified lobby\n" +
          "  friend request <user>   - Send a friend request\n" +
          "  friend accept <user>    - Accept a friend request\n" +
          "  friend reject <user>    - Reject a friend request\n" +
          "  appoint <nickname>      - Appoint a hacker (must be president)\n" +
          "  vote <yes|no>           - Vote on current appointment\n" +
          "  move <nodeId>           - Move in the game if you are hacker\n" +
          "  answer <answer>         - Submit a trivia answer\n" +
          "  role                    - Show your current role\n" +
          "  next                    - Finalize the result (hacker only)\n" +
          "  time <minutes>          - Set the lobby time limit (1-60)\n" +
          "  grid <3|9>              - Set the lobby grid size (3 or 9)\n" +
          "  logout                  - Log out\n" +
          "  help                    - Display commands\n"
        );

      case "clear":
        clearHistory();
        return "";

      default:
        return "Command does not exist";
    }
  };

  const handleCommand = async (command) => {
    const output = await executeCommand(command);
    if (output.length) {
      addHistory({ command, output });
    }
  };

  return (
    <div className="terminal">
      <TerminalHeader />
      <TerminalDisplay username={getNickname() || defaultUsername} history={history} />
      <TerminalInput username={getNickname() || defaultUsername} onCommand={handleCommand} />
    </div>
  );
};

export default Terminal;
