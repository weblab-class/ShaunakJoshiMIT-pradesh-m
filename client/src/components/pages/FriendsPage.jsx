// FriendsPage.jsx
import React, { useState, useContext, useEffect } from "react";
import Layout from "../Layout.jsx";
import onlinelogo from "../assets/images/assets/onlinelogo.png";
import offlinelogo from "../assets/images/assets/offlinelogo.png";
import "../styles/FriendsPage.css";
import { UserContext } from "../App.jsx";
import { get, post } from "../../utilities";
import { SocketContext } from "../modules/SocketContext.jsx";

const FriendsPage = (props) => {
  const { userId } = useContext(UserContext);
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [requestsData, setRequestsData] = useState([]);
  const [friendsData, setFriendsData] = useState([]);
  const socket = useContext(SocketContext);

  useEffect(() => {
    get("/api/user", { userid: userId }).then((userObj) => {
      setUser(userObj);
    });
    get(`/api/requests/sendRequest/${userId}`).then((requests) => {
      setRequests(requests);
    });
  }, [userId]);


  useEffect(() => {
    if (requests.length > 0) {
      Promise.all(
        requests.map(async (requestObj) => {
          const userObj = await get("/api/user", { userid: requestObj.from });
          return { user: userObj, date: requestObj.date };
        })
      ).then((results) => {
        setRequestsData(results);
      });
    } else {
      setRequestsData([]);
    }
  }, [requests]);

  useEffect(() => {
    socket.on("friendRequestReceived", (data) => {
      console.log("Got friend request from", data.from);
      get(`/api/requests/sendRequest/${userId}`).then((requests) => {
        setRequests(requests);
      });
    });

    socket.on("friendRequestAccepted", (data) => {
      console.log("Friend request was accepted", data);
      get("/api/user", { userid: userId }).then((userObj) => setUser(userObj));
      get(`/api/requests/sendRequest/${userId}`).then((requests) => {
        setRequests(requests);
      });
    });

    socket.on("friendRequestRejected", (data) => {
      console.log("friend request was rejected", data);
      get("/api/user", { userid: userId }).then((userObj) => setUser(userObj));
      get(`/api/requests/sendRequest/${userId}`).then((requests) => {
        setRequests(requests);
      });
    });
    return () => {
      socket.off("friendRequestReceived");
      socket.off("friendRequestAccepted");
      socket.off("friendRequestRejected");
    };
  }, [userId, socket]);

  const friends = user ? user.friends : [];

  useEffect(() => {
    if (friends.length > 0) {
      Promise.all(
        friends.map((friendId) => {
          return get("/api/user", { userid: friendId });
        })
      ).then((UserObjs) => {
        setFriendsData(UserObjs);
      });
    } else {
      setFriendsData([]);
    }
  }, [friends]);





  const friendRows = friendsData.map((friendObj, index) => {
    return (
      <tr className="Friends-Row" key={friendObj._id || index}>
        <th>{friendObj.nickname}</th>
        <th>
          <img
            className="online-offline-logo"
            src={friendObj.lobbyCode ? onlinelogo : offlinelogo}
            alt="online/offline status"
          />
        </th>
        <th>{friendObj.lobbyCode ? friendObj.lobbyCode : "offline"}</th>
      </tr>
    );
  });

  const requestRows = requestsData.map((data, index) => {
    const formattedDate = new Date(data.date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    return (
      <tr className="Requests-Row" key={data.user._id || index}>
        <th>{data.user.nickname}</th>
        <th>{formattedDate}</th>
      </tr>
    );
  });

  return (
    <Layout currentPage="friends">
      <div className="Friends-Page">
        {/* NEW: Animated background behind everything */}
        <div className="friends-bg" />

        <div className="Friends-Header">
          <h2>Friends</h2>
          {friends.length === 0 ? (
            <p>No friends yet. Add some!</p>
          ) : (
            <table className="Friends-Table">
              <thead>
                <tr>
                  <th>Friend</th>
                  <th>Online</th>
                  <th>Server ID</th>
                </tr>
              </thead>
              <tbody>{friendRows}</tbody>
            </table>
          )}
        </div>

        <div className="Requests-Header">
          <h2>Incoming Friend Requests</h2>
          {requestsData.length === 0 ? (
            <p>No incoming requests.</p>
          ) : (
            <table className="Requests-Table">
              <thead>
                <tr>
                  <th>Incoming Request From</th>
                  <th>Date Sent</th>
                </tr>
              </thead>
              <tbody>{requestRows}</tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FriendsPage;
