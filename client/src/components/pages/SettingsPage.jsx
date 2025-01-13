import React from "react";
import Terminal from "../modules/terminal";
import Layout from '../layout.jsx';

const SettingsPage = () =>{
    return (
        <Layout currentPage="settings">
            Welcome to the help page!
            <Terminal username = "shaunakj" />
        </Layout>
    );
}

export default SettingsPage;
