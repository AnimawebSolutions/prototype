const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/pixel", async (req, res) => {

    try {

        // IP real
        const forwarded = req.headers["x-forwarded-for"];

        const ip = forwarded
            ? forwarded.split(",")[0].trim()
            : req.socket.remoteAddress;

        // API GEO IP
        const response = await fetch(`https://ipapi.co/${ip}/json/`);

        const data = await response.json();

        // Hora
        const now = new Date().toLocaleString();

        // Headers
        const userAgent =
            req.headers["user-agent"] || "Unknown";

        const referer =
            req.headers["referer"] || "Direct";

        const language =
            req.headers["accept-language"] || "Unknown";

        // Consola
        console.log("==================================");
        console.log("TIME:", now);
        console.log("IP:", ip);
        console.log("COUNTRY:", data.country_name);
        console.log("CITY:", data.city);
        console.log("REGION:", data.region);
        console.log("ISP:", data.org);
        console.log("TIMEZONE:", data.timezone);
        console.log("LATITUDE:", data.latitude);
        console.log("LONGITUDE:", data.longitude);
        console.log("USER AGENT:", userAgent);
        console.log("LANGUAGE:", language);
        console.log("REFERER:", referer);
        console.log("==================================");

        // Guardar archivo
        const logData = {
            time: now,
            ip,
            country: data.country_name,
            city: data.city,
            region: data.region,
            isp: data.org,
            timezone: data.timezone,
            latitude: data.latitude,
            longitude: data.longitude,
            userAgent,
            language,
            referer
        };

        fs.appendFileSync(
            "logs.txt",
            JSON.stringify(logData) + "\n"
        );

    } catch (err) {

        console.log("ERROR:", err.message);

    }

    res.sendFile(
        path.join(__dirname, "img/pixel.png")
    );

});

app.listen(PORT, () => {

    console.log(`Running on port ${PORT}`);

});