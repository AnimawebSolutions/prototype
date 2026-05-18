const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

// IMPORTANTE para Render / proxies
app.set("trust proxy", true);

const PORT = process.env.PORT || 3000;

// Cache GEO simple
const cache = {};

/*
|--------------------------------------------------------------------------
| HEALTHCHECK
|--------------------------------------------------------------------------
| UptimeRobot debe apuntar aquí:
| https://TU-APP.onrender.com/
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {

    res.send("Server alive");

});

/*
|--------------------------------------------------------------------------
| PIXEL TRACKING
|--------------------------------------------------------------------------
*/

app.get("/pixel", async (req, res) => {

    try {

        // Obtener IP real
        const ip =
            req.headers["x-forwarded-for"]?.split(",")[0].trim()
            || req.socket.remoteAddress
            || req.ip;

        // Headers útiles
        const userAgent =
            req.headers["user-agent"] || "Unknown";

        const referer =
            req.headers["referer"] || "Direct";

        const language =
            req.headers["accept-language"] || "Unknown";

        /*
        |--------------------------------------------------------------------------
        | IGNORAR BOTS
        |--------------------------------------------------------------------------
        */

        const isBot =
            userAgent.includes("UptimeRobot") ||
            userAgent.includes("bot") ||
            userAgent.includes("Bot") ||
            userAgent.includes("crawler");

        if (isBot) {

            console.log("BOT DETECTED - IGNORING");

            return res.sendFile(
                path.join(__dirname, "img/pixel.png")
            );
        }

        /*
        |--------------------------------------------------------------------------
        | DETECTAR IPS PRIVADAS
        |--------------------------------------------------------------------------
        */

        const isPrivate =
            ip === "::1" ||
            ip === "127.0.0.1" ||
            ip.startsWith("10.") ||
            ip.startsWith("192.168.") ||
            ip.startsWith("172.");

        let geo = {};

        /*
        |--------------------------------------------------------------------------
        | GEOLOCALIZACIÓN
        |--------------------------------------------------------------------------
        */

        if (!isPrivate) {

            if (cache[ip]) {

                geo = cache[ip];

            } else {

                const response = await fetch(
                    `http://ip-api.com/json/${ip}`
                );

                geo = await response.json();

                cache[ip] = geo;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | FECHA
        |--------------------------------------------------------------------------
        */

        const now = new Date().toLocaleString();

        /*
        |--------------------------------------------------------------------------
        | LOG CONSOLA
        |--------------------------------------------------------------------------
        */

        console.log("==================================");
        console.log("TIME:", now);
        console.log("IP:", ip);

        if (!isPrivate && geo.status === "success") {

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

        /*
        |--------------------------------------------------------------------------
        | GUARDAR LOG
        |--------------------------------------------------------------------------
        */

        fs.appendFileSync(
            "logs.txt",
            JSON.stringify({
                time: now,
                ip,
                country: geo.country || null,
                city: geo.city || null,
                region: geo.regionName || null,
                isp: geo.isp || null,
                org: geo.org || null,
                latitude: geo.lat || null,
                longitude: geo.lon || null,
                timezone: geo.timezone || null,
                userAgent,
                language,
                referer
            }) + "\n"
        );

    } catch (err) {

        console.log("ERROR:", err.message);

    }

    /*
    |--------------------------------------------------------------------------
    | ENVIAR PIXEL
    |--------------------------------------------------------------------------
    */

    res.sendFile(
        path.join(__dirname, "img/pixel.png")
    );

});

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {

    console.log(`Running on port ${PORT}`);

});