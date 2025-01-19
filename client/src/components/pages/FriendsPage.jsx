import React, { useState, useContext, useEffect } from "react";
import Layout from '../layout.jsx';
import onlinelogo from "../../assets/onlinelogo.png";
import offlinelogo from "../../assets/offlinelogo.png";
import "./FriendsPage.css";
import { UserContext } from "../App.jsx";
import { get, post } from "../..//utilities"
import { socket } from "../../client-socket.js";



const FriendsPage = (props) => {

    const { userId, handleLogin, handleLogout} = useContext(UserContext);
    const [user, setUser] = useState(null);
    const [requests, setRequests] = useState([]);
    const [requestsData, setRequestsData] = useState([]);
    const [friendsData, setFriendsData] = useState([]);


    useEffect(() => {
        get("/api/user", { userid: userId}).then((userObj) => {
            setUser(userObj);
        });
        get(`/api/requests/sendRequest/${userId}`).then((requests) => {
            setRequests(requests)
        });

    }, [userId])

    useEffect(() => {
        if (requests.length > 0) {
            Promise.all(
                requests.map((requestObj) => {
                    return (get("/api/user", { userid: requestObj.from }))
                })
            ).then((fromUserObjs) => {
                setRequestsData(fromUserObjs);
            });
        } else {
            setRequestsData([]);
        }
    }, [requests])




    useEffect(() => {
        socket.on("friendRequestReceived", (data) => {
            console.log("Got friend request from", data.from);
            get(`/api/requests/sendRequest/${userId}`).then((requests) => {
                setRequests(requests);
            });
        });

        socket.on("friendRequestAccepted", (data) =>  {
            console.log("Friend request was accepted", data);
            get("/api/user", { userid: userId }).then((userObj) => setUser(userObj));
            get(`/api/requests/sendRequest/${userId}`).then((requests) => {
                setRequests(requests);
              });
        });

        socket.on("friendRequestRejected", (data) => {
            console.log("friend request was rejected", data);
            get("/api/user", {userid: userId}).then((userObj) => setUser(userObj));
            get(`/api/requests/sendRequest/${userId}`).then((requests) => {
                setRequests(requests);
              });

        });
        return () => {
            socket.off("friendRequestReceived");
            socket.off("friendRequestAccepted");
            socket.off("friendRequestRejected");
        };
    }, [userId]);

    const friends =  user ? user.friends: [];

    useEffect(() => {
        if (friends.length > 0) {
            Promise.all(
                friends.map((friendId) => {

                    return (get("/api/user", {userid: friendId}));
                })
            ).then((UserObjs) => {
                setFriendsData(UserObjs);
            })
        } else {
            setFriendsData([]);
        }
    }, [friends]);


    console.log("User Friends", friends)
    const friendRows = friendsData.map((friendObj) => {
        return (
            <tr className = "Friends-Row">
                <th>{friendObj.nickname}</th>
                {/* <th><img className = "online-offline-logo" src = {(friendObj.online) ? onlinelogo: offlinelogo} /></th> */}
                <th><img className = "online-offline-logo"  src = {onlinelogo} /></th>
                {/* <th>{(friendObj.online) ? friendObj.server_id: "offline" }</th> */}
                <th>"placeholder server id"</th>
            </tr>
        )
    })

    const requestRows = requestsData.map((fromUserObj, index) => {
        console.log("User Obj", fromUserObj)
        return (
        <tr className = "Requests-Row" key = {index}>
            <th>{fromUserObj.nickname}</th>
            <th>"Placeholder Date"</th>
        </tr>
    )});


    return (
        <Layout currentPage = "friends">
        <div className="Friends-Page">
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
    )
}

export default FriendsPage
