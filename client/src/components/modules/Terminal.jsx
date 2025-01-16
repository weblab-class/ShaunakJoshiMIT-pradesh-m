import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { TerminalContext } from "./TerminalContext";
import TerminalHeader from "./TerminalHeader";
import TerminalDisplay from "./TerminalDisplay";
import TerminalInput from "./TerminalInput";
import "./Terminal.css";

import { UserContext } from "../App";
import { createLobby, joinLobby, leaveLobby } from "../../api.js";

function tokenizeCommand(command) {
  return command.trim().split(/\s+/);
}

const Terminal = () => {
  const { history, addHistory, clearHistory } = useContext(TerminalContext);
  const { userId, handleLogout, decoded } = useContext(UserContext);
  const navigate = useNavigate();

  const defaultUsername = (decoded && decoded.name) ? decoded.name : userId || "anonymous";

  const getNickname = () => localStorage.getItem("nickname");

  const executeCommand = async (command) => {
    const tokens = tokenizeCommand(command);
    const primary = tokens[0]?.toLowerCase();

    switch (primary) {
      case "cd":
        switch (tokens[1]?.toLowerCase()) {
          case "profile":
            navigate("/profile");
            return "Navigating to profile page";
          case "home":
            navigate("/home");
            return "Navigating to home page";
          case "friends":
            navigate("/friends");
            return "Navigating to friends page";
          case "settings":
            navigate("/settings");
            return "Navigating to settings page";
          case "login":
            navigate("/");
            return "Navigating to login page";
          default:
            return "Command does not exist";
        }

      //command to set a nickname: "nickname <your nickname>"
      case "nickname": {
        const newNick = tokens.slice(1).join(" ").trim();
        if (!newNick || newNick.length > 12) {
          return "Nickname must be between 1 and 12 characters. Usage: nickname <your nickname>";
        }
        localStorage.setItem("nickname", newNick);
        return `Nickname set to: ${newNick}`;
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
        return "Invalid command. Did you mean 'create lobby'?";

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

      case "logout":
        handleLogout();
        return "Logging out";

      case "help":
        return "\nAvailable commands:\n\n" +
               "  clear                  - Clears the terminal\n" +
               "  cd home                - Navigate to home page\n" +
               "  cd profile             - Navigate to profile page\n" +
               "  cd friends             - Navigate to friends page\n" +
               "  nickname <your name>   - Set your nickname (1-12 characters)\n" +
               "  create lobby           - Create a new lobby (requires nickname set)\n" +
               "  join lobby <lobbyCode> - Join an existing lobby (requires nickname set)\n" +
               "  leave lobby <lobbyCode> - Leave the specified lobby\n" +
               "  help                   - Display commands\n";

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