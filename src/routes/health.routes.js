const express = require("express");
const router = express.Router();

const pool = require("../config/database");

router.get("/", async (req, res) => {

    try {

        await pool.query("SELECT NOW()");

        res.status(200).json({
            success: true,
            message: "kwiQeat API is running.",
            database: "connected",
            timestamp: new Date().toISOString()
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed."
        });

    }

});

module.exports = router;
