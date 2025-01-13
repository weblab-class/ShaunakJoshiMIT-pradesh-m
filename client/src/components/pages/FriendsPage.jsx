import React from "react";
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
        </div>
        </Layout>
    )
}

export default FriendsPage
