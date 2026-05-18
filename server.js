const express = require("express");
const path = require("path");

const app = express();

app.get("/pixel", (req, res) => {

    const ip =
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress;

    console.log("IP:", ip);

    res.sendFile(path.join(__dirname, "img/pixel.png"));
});

app.listen(3000, () => {
    console.log("Running");
});