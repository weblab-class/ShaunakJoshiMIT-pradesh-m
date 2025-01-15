const fetch = require("node-fetch");

const testCreateLobby = async () => {
    const response = await fetch("http://localhost:3000/api/lobby/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host_id: "user123" }),
    });
    const data = await response.json();
    console.log(data);
};

testCreateLobby();
