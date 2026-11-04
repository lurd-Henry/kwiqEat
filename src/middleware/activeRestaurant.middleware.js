const pool = require("../config/database");

const requireActiveRestaurant = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT status
             FROM restaurants
             WHERE id = $1`,
            [req.restaurantId]
        );

        if (!result.rows.length) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found."
            });
        }

        if (result.rows[0].status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Your restaurant must be approved before you can perform this action."
            });
        }

        next();

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to verify restaurant approval."
        });
    }
};

module.exports = requireActiveRestaurant;
