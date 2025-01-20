import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { TerminalContext } from "./TerminalContext";
import { UserContext } from "../App";
import {
  createLobby,
  joinLobby,
  leaveLobby,
  createGame,
} from "../../api.js";
import TerminalHeader from "./TerminalHeader";
import TerminalDisplay from "./TerminalDisplay";
import TerminalInput from "./TerminalInput";
import "./Terminal.css";


function tokenizeCommand(command) {
  return command.trim().split(/\s+/);
}

const Terminal = () => {
  const { history, addHistory, clearHistory } = useContext(TerminalContext);
  const { userId, decoded, handleLogout } = useContext(UserContext);
  const navigate = useNavigate();

  const getNickname = () => {
    return decoded?.nickname ? decoded.nickname : userId || "anonymous";
  };

  const executeCommand = async (command) => {
    const tokens = tokenizeCommand(command);
    const primary = tokens[0]?.toLowerCase();

    switch (primary) {
      case "cd":
        if (tokens[1]?.toLowerCase() === "home") {
          navigate("/home");
          return "Navigating to home page.";
        }
        if (tokens[1]?.toLowerCase() === "profile") {
          navigate("/profile");
          return "Navigating to profile page.";
        }
        if (tokens[1]?.toLowerCase() === "friends") {
          navigate("/friends");
          return "Navigating to home page.";
        }
        if (tokens[1]?.toLowerCase() === "game") {
          navigate("/game");
          return "Navigating to home page.";
        }

        return "Invalid cd command.";

      case "create":
        if (tokens[1]?.toLowerCase() === "lobby") {
          const nickname = getNickname();
          if (!nickname) {
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
          const host_id = getNickname();
          try {
            const response = await createGame(lobbyCode, host_id);
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
          const nickname = getNickname();
          if (!nickname) {
            return "Please set your nickname first with: nickname <your nickname>";
          }
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
        if (tokens[1]?.toLowerCase() === "lobby" && tokens[2]) {
          const lobbyCode = tokens[2].toUpperCase();
          const nickname = getNickname();
          try {
            const response = await leaveLobby(lobbyCode, nickname);
            navigate("/home");
            return `Successfully left the lobby: ${lobbyCode}. ${response.message}`;
          } catch (error) {
            return `Failed to leave lobby: ${error.message}`;
          }
        }
        return "Invalid leave command. Usage: leave lobby <lobbyCode>";

      case "logout":
        handleLogout();
        return "Logging out";

      case "clear":
        clearHistory();
        return "";

      case "help":
        return (
          "\nAvailable commands:\n\n" +
          "  clear                   - Clears the terminal\n" +
          "  cd home                 - Navigate to home page\n" +
          "  cd profile              - Navigate to profile page\n" +
          "  create lobby            - Create a new lobby (requires nickname set)\n" +
          "  create game             - Start the game (host only, requires at least 3 players)\n" +
          "  join lobby <lobbyCode>  - Join an existing lobby (requires nickname set)\n" +
          "  leave lobby <lobbyCode> - Leave the specified lobby\n" +
          "  logout                  - Log out of your account\n" +
          "  help                    - Display this help message\n"
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
      <TerminalDisplay username={getNickname()} history={history} />
      <TerminalInput username={getNickname()} onCommand={handleCommand} />
    </div>
  );
};

export default Terminal;
