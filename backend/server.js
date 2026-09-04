require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const pitchRoutes = require("./routes/pitchRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const startupRoutes = require("./routes/startupRoutes");
const postRoutes = require("./routes/postRoutes");
const messageRoutes = require("./routes/messageRoutes");
const groupRoutes = require("./routes/groupRoutes");

const app = express();


// ================= DATABASE =================

connectDB();


// ================= MIDDLEWARE =================

app.use(
    cors({
        origin: "*",
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);

app.use(
    express.json({
        limit: "10mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb"
    })
);

app.use(morgan("dev"));


// ================= HOME =================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Delta API is running 🚀",
        version: "3.0.0"
    });

});


// ================= HEALTH =================

app.get("/health", (req, res) => {

    res.json({
        success: true,
        message: "Delta backend is healthy"
    });

});


// ================= API =================

app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/pitches", pitchRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/startups", startupRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);


// ================= 404 =================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "API route not found",
        path: req.originalUrl,
        method: req.method
    });

});


// ================= ERROR =================

app.use((error, req, res, next) => {

    console.error(
        "Server error:",
        error
    );

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });

});


// ================= SERVER =================

const PORT =
    process.env.PORT || 5000;

app.listen(
    PORT,
    () => {
        console.log(
            `Delta server running on port ${PORT}`
        );
    }
);