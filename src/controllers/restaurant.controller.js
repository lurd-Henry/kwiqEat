const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// =====================================
// REGISTER RESTAURANT
// =====================================

exports.registerRestaurant = async (req, res) => {

    const client = await pool.connect();

    try {

        const {
            owner_name,
            email,
            phone,
            password,
            restaurant_name,
            description,
            address,
            city,
            state
        } = req.body;

        await client.query("BEGIN");

        // Check existing account

        const existingUser = await client.query(
            `SELECT id FROM users
             WHERE LOWER(email) = LOWER($1)
             OR ($2::varchar IS NOT NULL AND phone = $2)`,
            [email, phone || null]
        );

        if (existingUser.rows.length > 0) {

            await client.query("ROLLBACK");

            return res.status(409).json({
                success: false,
                message: "An account with this email or phone already exists."
            });

        }

        // Generate password hash

        const passwordHash = await bcrypt.hash(password, 12);

        // Create restaurant owner account

        const userResult = await client.query(
            `INSERT INTO users
             (full_name, email, phone, password_hash, role)
             VALUES ($1, $2, $3, $4, 'restaurant')
             RETURNING id, full_name, email, phone, role`,
            [
                owner_name,
                email.toLowerCase(),
                phone || null,
                passwordHash
            ]
        );

        const user = userResult.rows[0];

        // Generate unique slug

        const slugBase = restaurant_name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        const slug = `${slugBase}-${Date.now()}`;

        // Create restaurant

        const restaurantResult = await client.query(
            `INSERT INTO restaurants
             (name, slug, description, email, phone,
              address, city, state, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
             RETURNING *`,
            [
                restaurant_name,
                slug,
                description || null,
                email.toLowerCase(),
                phone || null,
                address,
                city || null,
                state || null
            ]
        );

        const restaurant = restaurantResult.rows[0];

        // Link owner to restaurant

        await client.query(
            `INSERT INTO restaurant_users
             (restaurant_id, user_id, staff_role)
             VALUES ($1, $2, 'owner')`,
            [restaurant.id, user.id]
        );

        await client.query("COMMIT");

        // Generate login token

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "7d"
            }
        );

        res.status(201).json({
            success: true,
            message: "Restaurant registration submitted. Await admin approval.",
            token,
            user,
            restaurant
        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error("Restaurant registration error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to register restaurant."
        });

    } finally {

        client.release();

    }

};


// =====================================
// GET ALL ACTIVE RESTAURANTS
// PUBLIC
// =====================================

exports.getPublicRestaurants = async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT id, name, slug, description,
                    address, city, state,
                    logo, cover_image,
                    delivery_fee, minimum_order,
                    rating, total_reviews, is_open
             FROM restaurants
             WHERE status = 'active'
             ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            count: result.rows.length,
            restaurants: result.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve restaurants."
        });

    }

};


// =====================================
// GET RESTAURANT PROFILE
// OWNER
// =====================================

exports.getMyRestaurant = async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT *
             FROM restaurants
             WHERE id = $1`,
            [req.restaurantId]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Restaurant not found."
            });

        }

        res.json({
            success: true,
            restaurant: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve restaurant."
        });

    }

};


// =====================================
// UPDATE RESTAURANT PROFILE
// OWNER
// =====================================

exports.updateMyRestaurant = async (req, res) => {

    try {

        const {
            name,
            description,
            phone,
            address,
            city,
            state,
            logo,
            cover_image
        } = req.body;

        const result = await pool.query(
            `UPDATE restaurants
             SET
                name = COALESCE($1, name),
                description = COALESCE($2, description),
                phone = COALESCE($3, phone),
                address = COALESCE($4, address),
                city = COALESCE($5, city),
                state = COALESCE($6, state),
                logo = COALESCE($7, logo),
                cover_image = COALESCE($8, cover_image),
                updated_at = NOW()
             WHERE id = $9
             RETURNING *`,
            [
                name,
                description,
                phone,
                address,
                city,
                state,
                logo,
                cover_image,
                req.restaurantId
            ]
        );

        res.json({
            success: true,
            message: "Restaurant profile updated.",
            restaurant: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to update restaurant."
        });

    }

};


// =====================================
// OPEN / CLOSE RESTAURANT
// OWNER
// =====================================

exports.toggleRestaurant = async (req, res) => {

    try {

        const { is_open } = req.body;

        if (typeof is_open !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "is_open must be true or false."
            });
        }

        const result = await pool.query(
            `UPDATE restaurants
             SET is_open = $1, updated_at = NOW()
             WHERE id = $2 AND status = 'active'
             RETURNING id, name, is_open`,
            [is_open, req.restaurantId]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Only approved restaurants can change availability."
            });
        }

        res.json({
            success: true,
            message: is_open
                ? "Your restaurant is now open."
                : "Your restaurant is now closed.",
            restaurant: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to update restaurant availability."
        });

    }

};


// =====================================
// ADMIN: GET ALL RESTAURANTS
// =====================================

exports.getAllRestaurants = async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT r.*, u.full_name AS owner_name,
                    u.email AS owner_email
             FROM restaurants r
             LEFT JOIN restaurant_users ru
                ON r.id = ru.restaurant_id
                AND ru.staff_role = 'owner'
             LEFT JOIN users u
                ON ru.user_id = u.id
             ORDER BY r.created_at DESC`
        );

        res.json({
            success: true,
            count: result.rows.length,
            restaurants: result.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve restaurants."
        });

    }

};


// =====================================
// ADMIN: UPDATE RESTAURANT STATUS
// =====================================

exports.updateRestaurantStatus = async (req, res) => {

    try {

        const { status } = req.body;

        const allowedStatuses = [
            "active",
            "rejected",
            "suspended"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid restaurant status."
            });
        }

        const result = await pool.query(
            `UPDATE restaurants
             SET status = $1, updated_at = NOW()
             WHERE id = $2
             RETURNING id, name, status`,
            [status, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found."
            });
        }

        res.json({
            success: true,
            message: `Restaurant status updated to ${status}.`,
            restaurant: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to update restaurant status."
        });

    }

};
