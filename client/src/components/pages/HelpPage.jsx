import React, { useContext } from "react";
import Layout from '../layout.jsx';
import Terminal from "../modules/terminal.jsx";


const HelpPage = () =>{
    return (
        <Layout currentPage="help">
            Welcome to the help page!
            <Terminal username = "shaunakj" />
        </Layout>
    );
}

export default HelpPage;
