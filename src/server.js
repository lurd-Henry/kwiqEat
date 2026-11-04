require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

const healthRoutes = require("./routes/health.routes.js");
const authRoutes = require("./routes/auth.routes.js");
// =====================================
// MIDDLEWARE
// =====================================

app.use(helmet());

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
}));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));


// =====================================
// API ROUTES
// =====================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        name: "kwiQeat API",
        version: "1.0.0",
        message: "Welcome to kwiQeat."
    });

});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

// =====================================
// 404 HANDLER
// =====================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "API endpoint not found."
    });

});


// =====================================
// GLOBAL ERROR HANDLER
// =====================================

app.use((error, req, res, next) => {

    console.error(error);

    res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error."
    });

});


// =====================================
// START SERVER
// =====================================

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {

    console.log(`kwiQeat API running on port ${PORT}`);

});
