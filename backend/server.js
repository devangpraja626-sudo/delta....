require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const pitchRoutes = require("./routes/pitchRoutes");

const app = express();


// ================= DATABASE =================

connectDB();


// ================= MIDDLEWARE =================

app.use(
    cors({
        origin: "*"
    })
);

app.use(
    express.json({
        limit: "10mb"
    })
);

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(morgan("dev"));


// ================= HOME ROUTE =================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Delta API is running 🚀",
        version: "1.0.0"
    });

});


// ================= API ROUTES =================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/profiles",
    profileRoutes
);

app.use(
    "/api/pitches",
    pitchRoutes
);


// ================= 404 =================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "API route not found"
    });

});


// ================= ERROR HANDLER =================

app.use((error, req, res, next) => {

    console.error(error);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });

});


// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `Delta server running on port ${PORT}`
    );

});