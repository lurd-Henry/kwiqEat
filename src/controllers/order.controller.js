const pool = require("../config/database");

// =====================================

// CREATE ORDER

// =====================================

exports.createOrder = async (req, res) => {

    const client = await pool.connect();

    try {

        const {

            delivery_name,

            delivery_phone,

            delivery_address,

            delivery_instructions,

            customer_note

        } = req.body;

        if (!delivery_name || !delivery_phone || !delivery_address) {

            return res.status(400).json({

                success: false,

                message: "Delivery details are required."

            });

        }

        await client.query("BEGIN");

        const cart = await client.query(

            `SELECT id FROM carts

             WHERE user_id = $1 AND status = 'active'

             FOR UPDATE`,

            [req.user.id]

        );

        if (!cart.rows.length) {

            await client.query("ROLLBACK");

            return res.status(400).json({

                success: false,

                message: "Your cart is empty."

            });

        }

        const cartId = cart.rows[0].id;

        const items = await client.query(

            `SELECT

                ci.quantity,

                f.id AS food_id,

                f.name,

                f.price,

                f.restaurant_id,

                f.is_available,

                r.name AS restaurant_name,

                r.delivery_fee,

                r.minimum_order,

                r.is_open,

                r.status

             FROM cart_items ci

             JOIN food_items f ON ci.food_item_id = f.id

             JOIN restaurants r ON f.restaurant_id = r.id

             WHERE ci.cart_id = $1

             FOR UPDATE OF ci, f, r`,

            [cartId]

        );

        if (!items.rows.length) {

            await client.query("ROLLBACK");

            return res.status(400).json({

                success: false,

                message: "Your cart is empty."

            });

        }

        const restaurant = items.rows[0];

        const unavailable = items.rows.some(item =>

            !item.is_available ||

            !item.is_open ||

            item.status !== "active" ||

            item.restaurant_id !== restaurant.restaurant_id

        );

        if (unavailable) {

            await client.query("ROLLBACK");

            return res.status(400).json({

                success: false,

                message: "Some items are unavailable or the restaurant is closed."

            });

        }

        const subtotal = items.rows.reduce(

            (sum, item) => sum + Number(item.price) * item.quantity,

            0

        );

        const deliveryFee = Number(restaurant.delivery_fee);

        const serviceFee = Math.round(subtotal * 0.03 * 100) / 100;

        if (subtotal < Number(restaurant.minimum_order)) {

            await client.query("ROLLBACK");

            return res.status(400).json({

                success: false,

                message: `Minimum order is ₦${restaurant.minimum_order}.`

            });

        }

        const total = subtotal + deliveryFee + serviceFee;

        const orderNumber =

            "KWQ" + Date.now().toString().slice(-8);

        const orderResult = await client.query(

            `INSERT INTO orders

             (

                order_number,

                customer_id,

                restaurant_id,

                status,

                payment_method,

                payment_status,

                subtotal,

                delivery_fee,

                service_fee,

                total,

                delivery_name,

                delivery_phone,

                delivery_address,

                delivery_instructions,

                customer_note

             )

             VALUES

             ($1, $2, $3, 'order_placed',

              'cash_on_delivery', 'pending',

              $4, $5, $6, $7, $8, $9, $10, $11, $12)

             RETURNING *`,

            [

                orderNumber,

                req.user.id,

                restaurant.restaurant_id,

                subtotal,

                deliveryFee,

                serviceFee,

                total,

                delivery_name,

                delivery_phone,

                delivery_address,

                delivery_instructions || null,

                customer_note || null

            ]

        );

        const order = orderResult.rows[0];

        for (const item of items.rows) {

            await client.query(

                `INSERT INTO order_items

                 (order_id, food_item_id, item_name,

                  unit_price, quantity, item_total)

                 VALUES ($1, $2, $3, $4, $5, $6)`,

                [

                    order.id,

                    item.food_id,

                    item.name,

                    item.price,

                    item.quantity,

                    Number(item.price) * item.quantity

                ]

            );

        }

        await client.query(

            `INSERT INTO order_status_history

             (order_id, status, changed_by, note)

             VALUES ($1, 'order_placed', $2, $3)`,

            [

                order.id,

                req.user.id,

                "Order successfully placed."

            ]

        );

        await client.query(

            `UPDATE carts

             SET status = 'converted'

             WHERE id = $1`,

            [cartId]

        );

        await client.query("COMMIT");

        res.status(201).json({

            success: true,

            message: "Your order has been placed.",

            order

        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error("Order creation error:", error);

        res.status(500).json({

            success: false,

            message: "Unable to place order."

        });

    } finally {

        client.release();

    }

};

// =====================================

// CUSTOMER ORDER HISTORY

// =====================================

exports.getMyOrders = async (req, res) => {

    try {

        const result = await pool.query(

            `SELECT

                o.*,

                r.name AS restaurant_name

             FROM orders o

             JOIN restaurants r ON o.restaurant_id = r.id

             WHERE o.customer_id = $1

             ORDER BY o.created_at DESC`,

            [req.user.id]

        );

        res.json({

            success: true,

            count: result.rows.length,

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

// CUSTOMER ORDER DETAILS

// =====================================

exports.getOrderDetails = async (req, res) => {

    try {

        const order = await pool.query(

            `SELECT *

             FROM orders

             WHERE id = $1 AND customer_id = $2`,

            [req.params.id, req.user.id]

        );

        if (!order.rows.length) {

            return res.status(404).json({

                success: false,

                message: "Order not found."

            });

        }

        const items = await pool.query(

            `SELECT * FROM order_items

             WHERE order_id = $1`,

            [req.params.id]

        );

        const history = await pool.query(

            `SELECT status, note, created_at

             FROM order_status_history

             WHERE order_id = $1

             ORDER BY created_at ASC`,

            [req.params.id]

        );

        res.json({

            success: true,

            order: order.rows[0],

            items: items.rows,

            history: history.rows

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Unable to retrieve order."

        });

    }

};
