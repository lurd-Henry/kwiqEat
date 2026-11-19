const pool = require("../config/database");

// =====================================

// PLATFORM OVERVIEW

// =====================================

exports.getOverview = async (req, res) => {

    try {

        const result = await pool.query(`

            SELECT

                (SELECT COUNT(*) FROM users

                 WHERE role = 'customer') AS customers,

                (SELECT COUNT(*) FROM restaurants

                 WHERE status = 'active') AS active_restaurants,

                (SELECT COUNT(*) FROM restaurants

                 WHERE status = 'pending') AS pending_restaurants,

                (SELECT COUNT(*) FROM orders) AS total_orders,

                (SELECT COALESCE(SUM(total), 0)

                 FROM orders

                 WHERE status = 'delivered') AS completed_order_value,

                (SELECT COUNT(*) FROM orders

                 WHERE status IN (

                    'order_placed',

                    'order_confirmed',

                    'preparing',

                    'out_for_delivery'

                 )) AS active_orders

        `);

        res.json({

            success: true,

            overview: result.rows[0]

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Unable to retrieve platform overview."

        });

    }

};

// =====================================

// ADMIN CUSTOMER LIST

// =====================================

exports.getCustomers = async (req, res) => {

    try {

        const result = await pool.query(

            `SELECT id, full_name, email, phone,

                    status, created_at

             FROM users

             WHERE role = 'customer'

             ORDER BY created_at DESC`

        );

        res.json({

            success: true,

            customers: result.rows

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Unable to retrieve customers."

        });

    }

};

// =====================================

// ADMIN ORDER LIST

// =====================================

exports.getOrders = async (req, res) => {

    try {

        const result = await pool.query(

            `SELECT

                o.*,

                u.full_name AS customer_name,

                r.name AS restaurant_name

             FROM orders o

             JOIN users u ON o.customer_id = u.id

             JOIN restaurants r ON o.restaurant_id = r.id

             ORDER BY o.created_at DESC`

        );

        res.json({

            success: true,

            orders: result.rows

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Unable to retrieve orders."

        });

    }

};

// =====================================

// ADMIN CATEGORY LIST

// =====================================

exports.getCategories = async (req, res) => {

    try {

        const result = await pool.query(

            "SELECT * FROM categories ORDER BY name ASC"

        );

        res.json({

            success: true,

            categories: result.rows

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Unable to retrieve categories."

        });

    }

};

// =====================================

// CREATE CATEGORY

// =====================================

exports.createCategory = async (req, res) => {

    try {

        const { name } = req.body;

        if (!name || !name.trim()) {

            return res.status(400).json({

                success: false,

                message: "Category name is required."

            });

        }

        const slug = name.toLowerCase()

            .trim()

            .replace(/[^a-z0-9]+/g, "-")

            .replace(/^-|-$/g, "");

        const result = await pool.query(

            `INSERT INTO categories (name, slug)

             VALUES ($1, $2)

             RETURNING *`,

            [name.trim(), slug]

        );

        res.status(201).json({

            success: true,

            category: result.rows[0]

        });

    } catch (error) {

        if (error.code === "23505") {

            return res.status(409).json({

                success: false,

                message: "This category already exists."

            });

        }

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Unable to create category."

        });

    }

};
