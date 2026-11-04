const pool = require("../config/database");

const verifyRestaurantOwnership = async (req, res, next) => {

    try {

        const result = await pool.query(
            `SELECT restaurant_id
             FROM restaurant_users
             WHERE user_id = $1
             LIMIT 1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: "You are not associated with a restaurant."
            });
        }

        req.restaurantId = result.rows[0].restaurant_id;

        next();

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to verify restaurant access."
        });

    }

};

module.exports = verifyRestaurantOwnership;
