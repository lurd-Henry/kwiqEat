const pool = require("../config/database");

// =====================================

// GET CART

// =====================================

exports.getCart = async (req, res) => {

    try {

        const cartResult = await pool.query(

            `SELECT id FROM carts

             WHERE user_id = $1 AND status = 'active'`,

            [req.user.id]

        );

        if (!cartResult.rows.length) {

            return res.json({

                success: true,

                cart: null,

                items: [],

                subtotal: 0

            });

        }

        const cartId = cartResult.rows[0].id;

        const itemsResult = await pool.query(

            `SELECT

                ci.id,

                ci.quantity,

                f.id AS food_id,

                f.name,

                f.price,

                f.image,

                r.id AS restaurant_id,

                r.name AS restaurant_name

             FROM cart_items ci

             JOIN food_items f ON ci.food_item_id = f.id

             JOIN restaurants r ON f.restaurant_id = r.id

             WHERE ci.cart_id = $1`,

            [cartId]

        );

        const subtotal = itemsResult.rows.reduce(

            (sum, item) => sum + Number(item.price) * item.quantity,

            0

        );

        res.json({

            success: true,

            cart: cartResult.rows[0],

            items: itemsResult.rows,

            subtotal

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Unable to retrieve cart."

        });

    }

};

// =====================================

// ADD ITEM TO CART

// =====================================

exports.addToCart = async (req, res) => {

    const client = await pool.connect();

    try {

        const { food_item_id, quantity = 1 } = req.body;

        const amount = Number(quantity);

        if (!food_item_id || !Number.isInteger(amount) ||

            amount < 1 || amount > 50) {

            return res.status(400).json({

                success: false,

                message: "Provide a valid food item and quantity."

            });

        }

        await client.query("BEGIN");

        const food = await client.query(

            `SELECT f.id, f.restaurant_id

             FROM food_items f

             JOIN restaurants r ON f.restaurant_id = r.id

             WHERE f.id = $1

             AND f.is_available = TRUE

             AND r.is_open = TRUE

             AND r.status = 'active'`,

            [food_item_id]

        );

        if (!food.rows.length) {

            await client.query("ROLLBACK");

            return res.status(404).json({

                success: false,

                message: "This food item is currently unavailable."

            });

        }

        const restaurantId = food.rows[0].restaurant_id;

        let cart = await client.query(

            `SELECT id FROM carts

             WHERE user_id = $1 AND status = 'active'

             FOR UPDATE`,

            [req.user.id]

        );

        let cartId;

        if (!cart.rows.length) {

            const created = await client.query(

                `INSERT INTO carts (user_id)

                 VALUES ($1)

                 RETURNING id`,

                [req.user.id]

            );

            cartId = created.rows[0].id;

        } else {

            cartId = cart.rows[0].id;

        }

        const existingItems = await client.query(

            `SELECT f.restaurant_id

             FROM cart_items ci

             JOIN food_items f ON ci.food_item_id = f.id

             WHERE ci.cart_id = $1

             LIMIT 1`,

            [cartId]

        );

        if (

            existingItems.rows.length &&

            existingItems.rows[0].restaurant_id !== restaurantId

        ) {

            await client.query("ROLLBACK");

            return res.status(409).json({

                success: false,

                message: "Your cart contains items from another restaurant. Clear your cart before switching restaurants."

            });

        }

        await client.query(

            `INSERT INTO cart_items

             (cart_id, food_item_id, quantity)

             VALUES ($1, $2, $3)

             ON CONFLICT (cart_id, food_item_id)

             DO UPDATE SET quantity =

                cart_items.quantity + EXCLUDED.quantity`,

            [cartId, food_item_id, amount]

        );

        await client.query("COMMIT");

        res.json({

            success: true,

            message: "Item added to cart."

        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Unable to add item to cart."

        });

    } finally {

        client.release();

    }

};

// =====================================

// UPDATE CART ITEM QUANTITY

// =====================================

exports.updateCartItem = async (req, res) => {

    try {

        const quantity = Number(req.body.quantity);

        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {

            return res.status(400).json({

                success: false,

                message: "Quantity must be between 1 and 50."

            });

        }

        const result = await pool.query(

            `UPDATE cart_items ci

             SET quantity = $1

             FROM carts c

             WHERE ci.id = $2

             AND ci.cart_id = c.id

             AND c.user_id = $3

             AND c.status = 'active'

             RETURNING ci.*`,

            [quantity, req.params.id, req.user.id]

        );

        if (!result.rows.length) {

            return res.status(404).json({

                success: false,

                message: "Cart item not found."

            });

        }

        res.json({

            success: true,

            message: "Cart updated."

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Unable to update cart."

        });

    }

};

// =====================================

// REMOVE CART ITEM

// =====================================

exports.removeCartItem = async (req, res) => {

    try {

        const result = await pool.query(

            `DELETE FROM cart_items ci

             USING carts c

             WHERE ci.id = $1

             AND ci.cart_id = c.id

             AND c.user_id = $2

             AND c.status = 'active'

             RETURNING ci.id`,

            [req.params.id, req.user.id]

        );

        if (!result.rows.length) {

            return res.status(404).json({

                success: false,

                message: "Cart item not found."

            });

        }

        res.json({

            success: true,

            message: "Item removed."

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Unable to remove item."

        });

    }

};

// =====================================

// CLEAR CART

// =====================================

exports.clearCart = async (req, res) => {

    try {

        await pool.query(

            `DELETE FROM carts

             WHERE user_id = $1 AND status = 'active'`,

            [req.user.id]

        );

        res.json({

            success: true,

            message: "Cart cleared."

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Unable to clear cart."

        });

    }

};
