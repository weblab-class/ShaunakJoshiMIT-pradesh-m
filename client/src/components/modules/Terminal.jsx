import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TerminalContext } from "./TerminalContext";
import { UserContext } from "../App";
import {
  createLobby,
  joinLobby,
  leaveLobby,
  createGame,
  setNickname,
} from "../../api.js";
import TerminalHeader from "./TerminalHeader";
import TerminalDisplay from "./TerminalDisplay";
import TerminalInput from "./TerminalInput";
import "../styles/Terminal.css";

function tokenizeCommand(command) {
  return command.trim().split(/\s+/);
}

const Terminal = () => {
  const { history, addHistory, clearHistory } = useContext(TerminalContext);
  const { userId, decoded, handleLogout } = useContext(UserContext);
  const navigate = useNavigate();

  // Return the nickname from the decoded user if available,
  // otherwise return "anonymous" if no nickname is set.
  const getNickname = () => {
    return decoded?.nickname || userId ? decoded?.nickname || userId : "anonymous";
  };

  // Initialize the local state with the current nickname,
  // which is either the decoded nickname or "anonymous" if not set.
  const [currentNickname, setCurrentNickname] = useState(getNickname());

  const executeCommand = async (command) => {
    const tokens = tokenizeCommand(command);
    const primary = tokens[0]?.toLowerCase();

    switch (primary) {
      case "cd": {
        const sub = tokens[1]?.toLowerCase();
        if (sub === "home") {
          navigate("/home");
          return "Navigating to home page.";
        }
        if (sub === "profile") {
          navigate("/profile");
          return "Navigating to profile page.";
        }
        if (sub === "friends") {
          navigate("/friends");
          return "Navigating to friends page.";
        }
        if (sub === "game") {
          navigate("/game");
          return "Navigating to game page.";
        }
        return "Invalid cd command.";
      }

      case "create":
        if (tokens[1]?.toLowerCase() === "lobby") {
          const nickname = currentNickname;
          if (!nickname || nickname === "anonymous") {
            return "Please set your nickname first with: nickname <your nickname>";
          }
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
          try {
            await createGame(lobbyCode, currentNickname);
            navigate("/game");
            return "Game created. Navigating to the game page.";
          } catch (error) {
            return `Failed to create game: ${error.message}`;
          }
        }
        return "Invalid create command. Try 'create lobby' or 'create game'.";

      case "join":
        if (tokens[1]?.toLowerCase() === "lobby" && tokens[2]) {
          const lobbyCode = tokens[2].toUpperCase();
          const nickname = currentNickname;
          if (!nickname || nickname === "anonymous") {
            return "Please set your nickname first with: nickname <your nickname>";
          }
          try {
            await joinLobby(lobbyCode, nickname);
            navigate(`/lobby/${lobbyCode}`);
            return `Joined lobby: ${lobbyCode}. Navigating to the lobby.`;
          } catch (error) {
            return `Failed to join lobby: ${error.message}`;
          }
        }
        return "Invalid join command. Usage: join lobby <lobbyCode>";

      case "leave":
        if (tokens[1]?.toLowerCase() === "lobby" && tokens[2]) {
          const lobbyCode = tokens[2].toUpperCase();
          try {
            const response = await leaveLobby(lobbyCode, currentNickname);
            navigate("/home");
            return `Successfully left the lobby: ${lobbyCode}. ${response.message}`;
          } catch (error) {
            return `Failed to leave lobby: ${error.message}`;
          }
        }
        return "Invalid leave command. Usage: leave lobby <lobbyCode>";

      case "nickname": {
        if (!userId) {
          return "No userId found for the current user. Please log in.";
        }
        const newNick = tokens.slice(1).join(" ").trim();
        if (!newNick || newNick.length === 0 || newNick.length > 12) {
          return "Nickname must be between 1 and 12 characters. Usage: nickname <your nickname>";
        }
        try {
          const response = await setNickname(userId, newNick);
          // Update the local state to immediately display the new nickname
          setCurrentNickname(response.nickname);
          return `Nickname set to: ${response.nickname}`;
        } catch (error) {
          return error.message || "Error setting nickname.";
        }
      }

      case "logout":
        handleLogout();
        return "Logging out";

      case "clear":
        clearHistory();
        return "";

      case "help":
        return (
          "\nAvailable commands:\n\n" +
          "  clear                       - Clears the terminal\n" +
          "  cd home                     - Navigate to home page\n" +
          "  cd profile                  - Navigate to profile page\n" +
          "  cd friends                  - Navigate to friends page\n" +
          "  cd game                     - Navigate to game page\n" +
          "  create lobby                - Create a new lobby (requires nickname set)\n" +
          "  create game                 - Start the game (host only, requires at least 3 players)\n" +
          "  join lobby <lobbyCode>      - Join an existing lobby (requires nickname set)\n" +
          "  leave lobby <lobbyCode>     - Leave the specified lobby\n" +
          "  nickname <your nickname>    - Set your nickname (1-12 chars)\n" +
          "  logout                      - Log out of your account\n" +
          "  help                        - Display this help message\n"
        );

      default:
        return "Command does not exist";
    }
  };

  const handleCommand = async (command) => {
    const output = await executeCommand(command);
    if (output !== undefined && output.length > 0) {
      addHistory({ command, output });
    }
  };

  return (
    <div className="terminal">
      <TerminalHeader />
      <TerminalDisplay username={currentNickname} history={history} />
      <TerminalInput username={currentNickname} onCommand={handleCommand} />
    </div>
  );
};

export default Terminal;
