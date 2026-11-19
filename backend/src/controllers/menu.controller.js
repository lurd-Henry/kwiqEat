const pool = require("../config/database");
const uploadImage = require("../utils/uploadImage");
const cloudinary = require("../config/cloudinary");


// =====================================
// CREATE FOOD ITEM
// =====================================

exports.createFood = async (req, res) => {

    try {

        const {
            name,
            description,
            price,
            category_id,
            is_featured
        } = req.body;

        if (!name || price === undefined || Number(price) < 0) {
            return res.status(400).json({
                success: false,
                message: "Food name and a valid price are required."
            });
        }

        if (!Number.isFinite(Number(price))) {
            return res.status(400).json({
                success: false,
                message: "Invalid food price."
            });
        }

        let image = null;

        if (req.file) {

            const uploaded = await uploadImage(req.file.buffer);

            image = uploaded.url;

        }

        if (category_id) {

            const category = await pool.query(
                "SELECT id FROM categories WHERE id = $1 AND is_active = TRUE",
                [category_id]
            );

            if (!category.rows.length) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid food category."
                });
            }

        }

        const result = await pool.query(
            `INSERT INTO food_items
             (restaurant_id, category_id, name, description,
              price, image, is_featured)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                req.restaurantId,
                category_id || null,
                name.trim(),
                description || null,
                Number(price),
                image,
                is_featured === true || is_featured === "true"
            ]
        );

        res.status(201).json({
            success: true,
            message: "Food item added successfully.",
            food: result.rows[0]
        });

    } catch (error) {

        console.error("Create food error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to add food item."
        });

    }

};


// =====================================
// GET RESTAURANT MENU
// OWNER
// =====================================

exports.getMyMenu = async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT f.*, c.name AS category_name
             FROM food_items f
             LEFT JOIN categories c ON f.category_id = c.id
             WHERE f.restaurant_id = $1
             ORDER BY f.created_at DESC`,
            [req.restaurantId]
        );

        res.json({
            success: true,
            count: result.rows.length,
            foods: result.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve menu."
        });

    }

};


// =====================================
// UPDATE FOOD ITEM
// OWNER
// =====================================

exports.updateFood = async (req, res) => {

    try {

        const {
            name,
            description,
            price,
            category_id,
            is_featured,
            is_available
        } = req.body;

        if (price !== undefined &&
            (!Number.isFinite(Number(price)) || Number(price) < 0)) {

            return res.status(400).json({
                success: false,
                message: "Invalid food price."
            });

        }

        if (category_id) {

            const category = await pool.query(
                "SELECT id FROM categories WHERE id = $1 AND is_active = TRUE",
                [category_id]
            );

            if (!category.rows.length) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid food category."
                });
            }

        }

        const existing = await pool.query(
            `SELECT id, image
             FROM food_items
             WHERE id = $1 AND restaurant_id = $2`,
            [req.params.id, req.restaurantId]
        );

        if (!existing.rows.length) {
            return res.status(404).json({
                success: false,
                message: "Food item not found."
            });
        }

        let image = existing.rows[0].image;

        if (req.file) {

            const uploaded = await uploadImage(req.file.buffer);

            image = uploaded.url;

        }

        const result = await pool.query(
            `UPDATE food_items
             SET
                name = COALESCE($1, name),
                description = COALESCE($2, description),
                price = COALESCE($3, price),
                category_id = CASE
                    WHEN $4::boolean THEN $5::uuid
                    ELSE category_id
                END,
                image = $6,
                is_featured = COALESCE($7, is_featured),
                is_available = COALESCE($8, is_available),
                updated_at = NOW()
             WHERE id = $9 AND restaurant_id = $10
             RETURNING *`,
            [
                name ?? null,
                description ?? null,
                price === undefined ? null : Number(price),
                category_id !== undefined,
                category_id || null,
                image,
                is_featured === undefined
                    ? null
                    : is_featured === true || is_featured === "true",
                is_available === undefined
                    ? null
                    : is_available === true || is_available === "true",
                req.params.id,
                req.restaurantId
            ]
        );

        res.json({
            success: true,
            message: "Food item updated.",
            food: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to update food item."
        });

    }

};


// =====================================
// DELETE FOOD ITEM
// OWNER
// =====================================

exports.deleteFood = async (req, res) => {

    try {

        const result = await pool.query(
            `DELETE FROM food_items
             WHERE id = $1 AND restaurant_id = $2
             RETURNING id`,
            [req.params.id, req.restaurantId]
        );

        if (!result.rows.length) {
            return res.status(404).json({
                success: false,
                message: "Food item not found."
            });
        }

        res.json({
            success: true,
            message: "Food item deleted."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to delete food item."
        });

    }

};


// =====================================
// PUBLIC RESTAURANT MENU
// =====================================

exports.getPublicMenu = async (req, res) => {

    try {

        const restaurant = await pool.query(
            `SELECT id, name, slug, is_open
             FROM restaurants
             WHERE slug = $1 AND status = 'active'`,
            [req.params.slug]
        );

        if (!restaurant.rows.length) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found."
            });
        }

        const result = await pool.query(
            `SELECT f.id, f.name, f.description,
                    f.price, f.image, f.is_featured,
                    c.name AS category_name
             FROM food_items f
             LEFT JOIN categories c ON f.category_id = c.id
             WHERE f.restaurant_id = $1
             AND f.is_available = TRUE
             ORDER BY f.created_at DESC`,
            [restaurant.rows[0].id]
        );

        res.json({
            success: true,
            restaurant: restaurant.rows[0],
            count: result.rows.length,
            foods: result.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve restaurant menu."
        });

    }

};


// =====================================
// DELETE FOOD IMAGE
// =====================================

// Image cleanup can be added once we store
// Cloudinary public IDs in the database.
