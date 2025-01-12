import react from "react";
import Terminal from "../modules/terminal";

const FriendsPage = (props) => {

    



    return (
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

    )

}

export default FriendsPage
