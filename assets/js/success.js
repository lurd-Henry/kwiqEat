// ===================================
// KWIQEAT ORDER CONFIRMATION
// ===================================

const order = JSON.parse(
    localStorage.getItem("kwiqEatLatestOrder") || "null"
);


function formatCurrency(amount) {

    return "₦" + Number(amount).toLocaleString("en-NG");

}


if (!order) {

    window.location.replace("index.html");

} else {

    document.getElementById("orderId").textContent = order.id;


    document.getElementById("successDetails").innerHTML = `

        <div>
            <span>Restaurant</span>
            <strong>${order.restaurant}</strong>
        </div>

        <div>
            <span>Customer</span>
            <strong>${order.customer.name}</strong>
        </div>

        <div>
            <span>Payment</span>
            <strong>Cash on delivery</strong>
        </div>

        <div>
            <span>Total</span>
            <strong>${formatCurrency(order.total)}</strong>
        </div>

        <div>
            <span>Order status</span>
            <strong class="order-status">${order.status}</strong>
        </div>

    `;

}


document.getElementById("year").textContent =
    new Date().getFullYear();
