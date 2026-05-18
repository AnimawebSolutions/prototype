const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/pixel", (req, res) => {

    const ip =
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress;

    console.log("IP:", ip);

    res.sendFile(path.join(__dirname, "img/pixel.png"));
});

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
});