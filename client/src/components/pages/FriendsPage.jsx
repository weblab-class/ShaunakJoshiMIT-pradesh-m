import React from "react";
import Terminal from "../modules/terminal";
import Layout from '../layout.jsx';

const FriendsPage = (props) => {
    return (
        <Layout currentPage = "friends">
        <div className = "Friends-Header">
            <table className="Friends-Table">
                <tr className = "Friends-Table-Labels">
                    <th>Friend</th>
                    <th>Online</th>
                    <th>Server ID</th>
                </tr>
            </table>
            <Terminal username = "shaunakj" />
        </div>
        </Layout>
    )

}

export default FriendsPage
