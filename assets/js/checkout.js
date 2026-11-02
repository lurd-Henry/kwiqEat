// ===================================
// KWIQEAT CHECKOUT SYSTEM
// ===================================

const CART_KEY = "kwiqEatCart";

const DELIVERY_FEE = 500;

const SERVICE_FEE_RATE = 0.03;

const cart = getCart();


// ===================================
// CART DATA
// ===================================

function getCart() {

    try {

        const data = JSON.parse(localStorage.getItem(CART_KEY));

        return Array.isArray(data) ? data : [];

    } catch {

        return [];

    }

}


function formatCurrency(amount) {

    return "₦" + Number(amount).toLocaleString("en-NG");

}


const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
);

const deliveryFee = cart.length ? DELIVERY_FEE : 0;

const serviceFee = cart.length
    ? Math.round(subtotal * SERVICE_FEE_RATE)
    : 0;

const grandTotal = subtotal + deliveryFee + serviceFee;


// ===================================
// RENDER ORDER SUMMARY
// ===================================

function renderCheckout() {

    const container = document.getElementById("checkoutItems");

    if (!cart.length) {

        container.innerHTML = `
            <p>Your cart is empty.</p>
            <a href="index.html">Explore restaurants</a>
        `;

        document.getElementById("placeOrderBtn").disabled = true;

        return;

    }


    container.innerHTML = cart.map(item => `

        <div class="checkout-product">

            <img src="${item.image}" alt="${item.name}">

            <div>
                <strong>${item.name}</strong>
                <small>Qty: ${item.quantity}</small>
            </div>

            <span>
                ${formatCurrency(item.price * item.quantity)}
            </span>

        </div>

    `).join("");


    document.getElementById("checkoutSubtotal").textContent =
        formatCurrency(subtotal);

    document.getElementById("checkoutDelivery").textContent =
        formatCurrency(deliveryFee);

    document.getElementById("checkoutService").textContent =
        formatCurrency(serviceFee);

    document.getElementById("checkoutTotal").textContent =
        formatCurrency(grandTotal);

}


// ===================================
// PAYMENT METHOD
// ===================================

document.querySelectorAll('input[name="payment"]').forEach(input => {

    input.addEventListener("change", () => {

        const online = document.querySelector(
            'input[name="payment"]:checked'
        ).value === "online";

        document.getElementById("placeOrderBtn").textContent =
            online
                ? "Continue to payment →"
                : "Place order →";

    });

});


// ===================================
// PLACE ORDER
// ===================================

document.getElementById("checkoutForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        if (!cart.length) {

            alert("Your cart is empty.");

            return;

        }


        const formData = new FormData(this);

        const payment = formData.get("payment");


        // Online payment is not integrated yet.

        if (payment === "online") {

            alert(
                "Online payment integration is coming soon. Please select Cash on Delivery for this demo."
            );

            return;

        }


        const order = {

            id: "KWQ" + Date.now().toString().slice(-8),

            restaurant: cart[0].restaurantName,

            customer: {

                name: formData.get("fullName"),

                phone: formData.get("phone"),

                email: formData.get("email"),

                address: formData.get("address"),

                city: formData.get("city"),

                landmark: formData.get("landmark"),

                instructions: formData.get("instructions")

            },

            items: cart,

            subtotal,

            deliveryFee,

            serviceFee,

            total: grandTotal,

            paymentMethod: payment,

            status: "Order placed",

            createdAt: new Date().toISOString()

        };


        // DEMO ORDER STORAGE

        const previousOrders = JSON.parse(
            localStorage.getItem("kwiqEatOrders") || "[]"
        );

        previousOrders.push(order);

        localStorage.setItem(
            "kwiqEatOrders",
            JSON.stringify(previousOrders)
        );


        localStorage.setItem(
            "kwiqEatLatestOrder",
            JSON.stringify(order)
        );


        // CLEAR CART

        localStorage.removeItem(CART_KEY);


        // REDIRECT

        window.location.href = "order-success.html";

    }

);


// ===================================
// INITIALIZE
// ===================================

document.getElementById("year").textContent =
    new Date().getFullYear();

renderCheckout();
