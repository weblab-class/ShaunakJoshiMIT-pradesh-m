import React, { useState, useContext } from "react";
import Layout from '../layout.jsx';
import onlinelogo from "../../assets/onlinelogo.png";
import offlinelogo from "../../assets/offlinelogo.png";
import "./FriendsPage.css";
import { UserContext } from "../App.jsx";
import { get, post } from "../..//utilities"


const FriendsPage = (props) => {

    const { userID, handleLogin, handleLogout} = useContext(UserContext);
    const [user, setUser] = useState(null);
    const [requests, setRequests] = useState([]);


    const hardcodedFriends = [
        {name: "shaunak", online: false, server_id: 19149},
        {name: "pradesh", online: true, server_id: 19249},
        {name: "theo", online: true, server_id: 19349}];

    get("/routes/userRoutes/user", { userid: userID}).then((userObj) => {
        setUser(userObj);
    });

    get(`/routes/requestsRoutes/Friend-Requests/${userID}`).then((requests) => {
        setRequests(requests)
    })


    const rows = hardcodedFriends.map((friendObj) => {
        return (
        <tr className = "Friends-Row">
            <th>{friendObj.name}</th>
            <th><img className = "online-offline-logo" src = {(friendObj.online) ? onlinelogo: offlinelogo} /></th>
            <th>{(friendObj.online) ? friendObj.server_id: "offline" }</th>
        </tr>)
    })

    // const friends = user.friends;
    // const rows =

    return (
        <Layout currentPage = "friends">
        <div className = "Friends-Header">
            <table className="Friends-Table">
                <thead className = "Friends-Table-Labels">
                    <tr>
                        <th>Friend</th>
                        <th>Online</th>
                        <th>Server ID</th>
                    </tr>
                </thead>

                <tbody className = "Friends-Table-Body">
                    {rows}
                </tbody>
            </table>
        </div>
        </Layout>
    )
}

export default FriendsPage
