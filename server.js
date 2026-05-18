const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/pixel", async (req, res) => {

    try {

        // Obtener IP real
        const forwarded = req.headers["x-forwarded-for"];

        const ip = forwarded
            ? forwarded.split(",")[0].trim()
            : req.socket.remoteAddress;

        // Geolocalización IP
        const response = await fetch(`https://ipwho.is/${ip}`);

        const data = await response.json();

        // Fecha y hora
        const now = new Date().toLocaleString();

        // Headers útiles
        const userAgent = req.headers["user-agent"] || "Unknown";

        const referer = req.headers["referer"] || "Direct";

        const language = req.headers["accept-language"] || "Unknown";

        // Log consola
        console.log("==================================");
        console.log("TIME:", now);
        console.log("IP:", ip);
        console.log("COUNTRY:", data.country);
        console.log("CITY:", data.city);
        console.log("REGION:", data.region);
        console.log("ISP:", data.connection?.isp);
        console.log("ORG:", data.connection?.org);
        console.log("TIMEZONE:", data.timezone?.id);
        console.log("USER AGENT:", userAgent);
        console.log("LANGUAGE:", language);
        console.log("REFERER:", referer);
        console.log("==================================");

        // Guardar archivo
        const logData = {
            time: now,
            ip,
            country: data.country,
            city: data.city,
            region: data.region,
            isp: data.connection?.isp,
            org: data.connection?.org,
            timezone: data.timezone?.id,
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

    // Enviar imagen
    res.sendFile(
        path.join(__dirname, "img/pixel.png")
    );

});

app.listen(PORT, () => {

    console.log(`Running on port ${PORT}`);

});