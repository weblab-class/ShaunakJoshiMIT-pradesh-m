import React, { useEffect, useState, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Layout from "../Layout.jsx"
import { io } from "socket.io-client"
import { UserContext } from "../App"
import "../styles/LobbyPage.css"

const socket = io("http://localhost:3000")

const LobbyPage = () => {
  const { lobbyCode } = useParams()
  const navigate = useNavigate()
  const [lobby, setLobby] = useState(null)
  const { decoded } = useContext(UserContext)
  const nickname = decoded?.nickname || "anonymous"

  useEffect(() => {
    socket.emit("joinLobby", lobbyCode, nickname)
    socket.on("updateUsers", (data) => {
      setLobby((prevLobby) => ({
        ...prevLobby,
        user_ids: data.users || (prevLobby ? prevLobby.user_ids : []),
        host_id: data.host_id || (prevLobby ? prevLobby.host_id : null),
      }))
    })
    socket.on("lobbyData", (lobbyData) => {
      setLobby(lobbyData)
    })
    socket.on("gameStarted", () => {
      navigate("/game")
    })
    return () => {
      socket.emit("leaveLobby", lobbyCode, nickname)
      socket.off("updateUsers")
      socket.off("lobbyData")
      socket.off("gameStarted")
    }
  }, [lobbyCode, nickname, navigate])

  const users = lobby?.user_ids || []
  const host = lobby?.host_id || (users.length ? users[0] : null)

  return (
    <Layout currentPage="lobby">
      <div className="lobby-page">
        <div className="lobby-container">
          <h1 className="lobby-title">Lobby: {lobbyCode}</h1>
          {host && (
            <h2 className="lobby-host">
              Host: <span className="host-name">{host}</span>
            </h2>
          )}
          <div className="lobby-users">
            <h2>Users in Lobby</h2>
            {users.length === 0 ? (
              <p className="no-users">No users in lobby</p>
            ) : (
              <ul className="users-list">
                {users.map((user, index) => (
                  <li key={index} className="user-item">
                    {user} {user === host && <span className="host-badge">(Host)</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default LobbyPage