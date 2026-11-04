const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const authenticate = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const result = await pool.query(
            `SELECT id, role, status
             FROM users
             WHERE id = $1`,
            [decoded.id]
        );

        if (!result.rows.length) {
            return res.status(401).json({
                success: false,
                message: "Account not found."
            });
        }

        const user = result.rows[0];

        if (user.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Your account is suspended or inactive."
            });
        }

        req.user = {
            id: user.id,
            role: user.role
        };

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token."
        });

    }

};


const authorize = (...roles) => {

    return (req, res, next) => {

        if (!req.user || !roles.includes(req.user.role)) {

            return res.status(403).json({
                success: false,
                message: "Access denied."
            });

        }

        next();

    };

};


module.exports = {
    authenticate,
    authorize
};
