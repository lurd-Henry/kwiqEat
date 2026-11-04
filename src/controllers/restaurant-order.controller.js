const pool = require("../config/database");


// =====================================
// GET RESTAURANT ORDERS
// =====================================

exports.getOrders = async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT
                o.*,
                u.full_name AS customer_name,
                u.email AS customer_email
             FROM orders o
             JOIN users u ON o.customer_id = u.id
             WHERE o.restaurant_id = $1
             ORDER BY o.created_at DESC`,
            [req.restaurantId]
        );

        res.json({
            success: true,
            orders: result.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve restaurant orders."
        });

    }

};


// =====================================
// UPDATE ORDER STATUS
// =====================================

exports.updateOrderStatus = async (req, res) => {

    const client = await pool.connect();

    try {

        const { status, note } = req.body;

        const allowedTransitions = {
            order_placed: ["order_confirmed", "cancelled"],
            order_confirmed: ["preparing", "cancelled"],
            preparing: ["out_for_delivery", "cancelled"],
            out_for_delivery: ["delivered"],
            delivered: [],
            cancelled: []
        };

        await client.query("BEGIN");

        const order = await client.query(
            `SELECT id, status
             FROM orders
             WHERE id = $1
             AND restaurant_id = $2
             FOR UPDATE`,
            [req.params.id, req.restaurantId]
        );

        if (!order.rows.length) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Order not found."
            });

        }

        const currentStatus = order.rows[0].status;

        if (!allowedTransitions[currentStatus]?.includes(status)) {

            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message: "Invalid order status transition."
            });

        }

        await client.query(
            `UPDATE orders
             SET status = $1, updated_at = NOW()
             WHERE id = $2`,
            [status, req.params.id]
        );

        await client.query(
            `INSERT INTO order_status_history
             (order_id, status, changed_by, note)
             VALUES ($1, $2, $3, $4)`,
            [
                req.params.id,
                status,
                req.user.id,
                note || null
            ]
        );

        await client.query(
            `INSERT INTO notifications
             (user_id, title, message)
             SELECT customer_id, $1, $2
             FROM orders
             WHERE id = $3`,
            [
                "Order update",
                `Your order status is now ${status.replace(/_/g, " ")}.`,
                req.params.id
            ]
        );

        await client.query("COMMIT");

        res.json({
            success: true,
            message: "Order status updated."
        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to update order."
        });

    } finally {

        client.release();

    }

};


// =====================================
// RESTAURANT SALES SUMMARY
// =====================================

exports.getSales = async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT
                COUNT(*) AS total_orders,
                COALESCE(SUM(total) FILTER (
                    WHERE status = 'delivered'
                ), 0) AS completed_revenue,
                COUNT(*) FILTER (
                    WHERE status IN (
                        'order_placed',
                        'order_confirmed',
                        'preparing',
                        'out_for_delivery'
                    )
                ) AS active_orders
             FROM orders
             WHERE restaurant_id = $1`,
            [req.restaurantId]
        );

        res.json({
            success: true,
            sales: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve sales."
        });

    }

};
