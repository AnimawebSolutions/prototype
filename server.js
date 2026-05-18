const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

// IMPORTANTE para Render / proxies
app.set("trust proxy", true);

const PORT = process.env.PORT || 3000;

const cache = {};

app.get("/pixel", async (req, res) => {

    try {

        // obtiene la IP real
        const ip =
            req.headers["x-forwarded-for"]?.split(",")[0].trim()
            || req.socket.remoteAddress
            || req.ip;

        let geo = {};

        const isPrivate =
            ip === "::1" ||
            ip === "127.0.0.1" ||
            ip.startsWith("10.") ||
            ip.startsWith("192.168.") ||
            ip.startsWith("172.");

        // GEO IP
        if (!isPrivate) {

            if (cache[ip]) {

                geo = cache[ip];

            } else {

                const response = await fetch(`http://ip-api.com/json/${ip}`);

                geo = await response.json();

                console.log(geo);

                cache[ip] = geo;
            }
        }

        const now = new Date().toLocaleString();

        const userAgent =
            req.headers["user-agent"] || "Unknown";

        const referer =
            req.headers["referer"] || "Direct";

        const language =
            req.headers["accept-language"] || "Unknown";

        console.log("==================================");
        console.log("TIME:", now);
        console.log("IP:", ip);

        if (!isPrivate) {

            console.log("COUNTRY:", geo.country);
            console.log("CITY:", geo.city);
            console.log("REGION:", geo.regionName);
            console.log("ISP:", geo.isp);
            console.log("ORG:", geo.org);
            console.log("LATITUDE:", geo.lat);
            console.log("LONGITUDE:", geo.lon);
            console.log("TIMEZONE:", geo.timezone);

        } else {

            console.log("LOCAL/PRIVATE IP");

        }

        console.log("USER AGENT:", userAgent);
        console.log("LANGUAGE:", language);
        console.log("REFERER:", referer);
        console.log("==================================");

        // Guardar logs
        fs.appendFileSync(
            "logs.txt",
            JSON.stringify({
                time: now,
                ip,
                geo,
                userAgent,
                language,
                referer
            }) + "\n"
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