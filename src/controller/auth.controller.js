const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");


// =====================================
// GENERATE JWT
// =====================================

const generateToken = (user) => {

    return jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d"
        }
    );

};


// =====================================
// REGISTER CUSTOMER
// =====================================

exports.register = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {

        const { full_name, email, phone, password } = req.body;

        const existingUser = await pool.query(
            `SELECT id FROM users
             WHERE LOWER(email) = LOWER($1)
             OR ($2::varchar IS NOT NULL AND phone = $2)`,
            [email, phone || null]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "An account with this email or phone already exists."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `INSERT INTO users
             (full_name, email, phone, password_hash, role)
             VALUES ($1, $2, $3, $4, 'customer')
             RETURNING id, full_name, email, phone, role, status`,
            [
                full_name,
                email.toLowerCase(),
                phone || null,
                passwordHash
            ]
        );

        const user = result.rows[0];

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: "Your kwiQeat account has been created.",
            token,
            user
        });

    } catch (error) {

        console.error("Registration error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to create account."
        });

    }

};


// =====================================
// LOGIN
// =====================================

exports.login = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {

        const { email, password } = req.body;

        const result = await pool.query(
            `SELECT id, full_name, email, phone,
                    password_hash, role, status
             FROM users
             WHERE LOWER(email) = LOWER($1)`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        if (user.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Your account is not currently active."
            });
        }

        const token = generateToken(user);

        delete user.password_hash;

        res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user
        });

    } catch (error) {

        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to log in."
        });

    }

};


// =====================================
// GET CURRENT USER
// =====================================

exports.getMe = async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT id, full_name, email, phone,
                    role, status, profile_image, created_at
             FROM users
             WHERE id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        res.json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve account."
        });

    }

};
