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
// import "./Terminal.css";
import "../styles/Terminal.css";

import { UserContext } from "../App";
import { SocketContext } from "./SocketContext.jsx";

function tokenizeCommand(command) {
  return command.trim().split(/\s+/);
}

const Terminal = () => {
  const { history, addHistory, clearHistory } = useContext(TerminalContext);
  const { userId, handleLogin, handleLogout, decoded } = useContext(UserContext);
  const socket = useContext(SocketContext);

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

    switch (primary) {
      case "cd":
        switch (tokens[1]?.toLowerCase()) {
          case "profile":
            navigate("/profile");
            return "Navigating to the profile page";
          case "home":
            navigate("/home");
            return "Navigating to the home page";
          case "friends":
            navigate("/friends");
            return "Navigating to the friends page";
          case "settings":
            navigate("/settings");
            return "Navigating to the settings page";
          case "login":
            navigate("/");
            return "Navigating to the login page";
          default:
            return "Command does not exist";
        }

      case "create":
        if (tokens[1]?.toLowerCase() === "lobby") {
          const nickname = getNickname();
          if (!nickname) return "Please set your nickname first with: nickname <your nickname>";
          try {
            const lobby = await createLobby(nickname);
            navigate(`/lobby/${lobby.lobbyCode}`);
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
            // socket.emit("gameStarted", {lobbyCode, game: response});
            return "Game created. Navigating to the game page.";
          } catch (error) {
            return `Failed to create game: ${error.message}`;
          }
        }

        return "Invalid create command. Try 'create lobby' or 'create game'.";


      case "appoint":
        if (tokens.length > 2) {
          return "Invalid appoint command. Usage: appoint <nickname>";z
        }


        const appointee = tokens[1].toLowerCase();
        const pathParts = window.location.pathname.split("/");
        const lobbyCode = pathParts[2];
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



      case "join":
        if (tokens[1]?.toLowerCase() === "lobby" && tokens.length === 3) {
          const lobbyCode = tokens[2].toUpperCase();
          const nickname = getNickname();
          if (!nickname) return "Please set your nickname first with: nickname <your nickname>";
          try {
            const lobby = await joinLobby(lobbyCode, nickname);
            navigate(`/lobby/${lobbyCode}`);
            return `Joined lobby: ${lobbyCode}. Navigating to the lobby.`;
          } catch (error) {
            return `Failed to join lobby: ${error.message}`;
          }
        }
        return "Invalid join command. Usage: join lobby <lobbyCode>";

      case "leave":
        if (tokens[1]?.toLowerCase() === "lobby" && tokens.length === 3) {
          const lobbyCode = tokens[2].toUpperCase();
          const nickname = getNickname() || defaultUsername;
          try {
            const response = await leaveLobby(lobbyCode, nickname);
            navigate("/home");
            return `Successfully left the lobby: ${lobbyCode}. ${response.message}`;
          } catch (error) {
            return `Failed to leave lobby: ${error.message}`;
          }
        }
        return "Invalid leave command. Usage: leave lobby <lobbyCode>";

      case "nickname": {
        const newNick = tokens.slice(1).join(" ").trim();
        if (!newNick || newNick.length > 16 || newNick.length < 4 || newNick.indexOf(" ") >= 0) {
          return "Nickname must be between 1 and 16 characters and cannot have spaces. Usage: nickname <your-nickname>";
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
              await post("/api/requests/sendRequest", { from: userId, to: reqNickName });
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
              const result = await post("/api/requests/sendRequest/accept", {
                from: reqNickName,
                to: userId,
              });
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
              return `Successfully rejected ${reqNickName}'s friend request.`;
            } catch (error) {
              return `Error rejecting friend request: ${error.message}`;
            }

          default:
            return "Invalid friend subcommand. Try: friend request <username>";
        }

      case "logout":
        handleLogout();
        return "Logging out";

      case "help":
        return "\nAvailable commands:\n\n" +
               "  clear                   - Clears the terminal\n" +
               "  cd home                 - Navigate to home page\n" +
               "  cd profile              - Navigate to profile page\n" +
               "  cd friends              - Navigate to friends page\n" +
               "  nickname <your name>    - Set your nickname (1-16 characters)\n" +
               "  create lobby            - Create a new lobby (requires nickname set)\n" +
               "  join lobby <lobbyCode>  - Join an existing lobby (requires nickname set)\n" +
               "  leave lobby <lobbyCode> - Leave the specified lobby\n" +
               "  help                    - Display commands\n";

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
