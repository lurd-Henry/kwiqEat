const CART_KEY = "kwiqEatCart";
const ACCOUNT_KEY = "kwiQeatAccount";
const ORDERS_KEY = "kwiQeatOrders";

const DELIVERY_FEE = 500;
const SERVICE_RATE = 0.03;

const checkoutForm = document.getElementById("checkoutForm");

function getStorage(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
}

let cart = getStorage(CART_KEY, []);
let account = getStorage(ACCOUNT_KEY, null);

const addressSelect = document.getElementById("savedAddressSelect");


// ---------- CART SUMMARY ----------

function calculateTotals() {
    const subtotal = cart.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
    );

    const delivery = cart.length ? DELIVERY_FEE : 0;
    const service = Math.round(subtotal * SERVICE_RATE);

    return {
        subtotal,
        delivery,
        service,
        total: subtotal + delivery + service
    };
}


function renderCheckoutSummary() {
    const container = document.getElementById("checkoutItems");

    if (!container) return;

    container.innerHTML = "";

    cart.forEach(item => {
        const row = document.createElement("div");
        row.className = "checkout-item";

        const name = document.createElement("span");
        name.textContent = `${item.name} × ${item.quantity}`;

        const price = document.createElement("strong");
        price.textContent =
            `₦${(item.price * item.quantity).toLocaleString()}`;

        row.append(name, price);
        container.appendChild(row);
    });

    const totals = calculateTotals();

    document.getElementById("checkoutSubtotal").textContent =
        `₦${totals.subtotal.toLocaleString()}`;

    document.getElementById("checkoutDelivery").textContent =
        `₦${totals.delivery.toLocaleString()}`;

    document.getElementById("checkoutService").textContent =
        `₦${totals.service.toLocaleString()}`;

    document.getElementById("checkoutTotal").textContent =
        `₦${totals.total.toLocaleString()}`;
}


// ---------- SAVED ADDRESSES ----------

function renderSavedAddresses() {

    if (!addressSelect) return;

    addressSelect.innerHTML =
        '<option value="">Enter a new address</option>';

    if (!account || !Array.isArray(account.addresses)) return;

    account.addresses.forEach(address => {

        const option = document.createElement("option");

        option.value = address.id;

        option.textContent =
            `${address.label} — ${address.street}, ${address.city}`;

        addressSelect.appendChild(option);

    });
}


addressSelect?.addEventListener("change", () => {

    if (!account) return;

    const selected = account.addresses.find(
        address => String(address.id) === addressSelect.value
    );

    if (!selected) {
        document.getElementById("address").value = "";
        document.getElementById("city").value = "";
        document.getElementById("landmark").value = "";
        return;
    }

    document.getElementById("address").value = selected.street;
    document.getElementById("city").value = selected.city;
    document.getElementById("landmark").value =
        selected.landmark || "";

    document.getElementById("savedAddressHint").textContent =
        `Using your saved ${selected.label.toLowerCase()} address.`;

});


// ---------- SAVE NEW ADDRESS ----------

function saveDeliveryAddress(customer) {

    if (!account) return;

    const shouldSave =
        document.getElementById("saveAddress")?.checked;

    if (!shouldSave) return;

    const address = {
        id: Date.now(),
        label: "Delivery Address",
        street: customer.address,
        city: customer.city,
        landmark: customer.landmark
    };

    if (!Array.isArray(account.addresses)) {
        account.addresses = [];
    }

    const alreadyExists = account.addresses.some(item =>
        item.street.toLowerCase() === address.street.toLowerCase() &&
        item.city.toLowerCase() === address.city.toLowerCase()
    );

    if (!alreadyExists) {
        account.addresses.push(address);

        localStorage.setItem(
            ACCOUNT_KEY,
            JSON.stringify(account)
        );
    }
}


// ---------- PLACE ORDER ----------

checkoutForm?.addEventListener("submit", event => {

    event.preventDefault();

    if (!cart.length) {
        alert("Your cart is empty.");
        window.location.href = "cart.html";
        return;
    }

    const customer = {
        name: document.getElementById("fullName").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
        address: document.getElementById("address").value.trim(),
        city: document.getElementById("city").value.trim(),
        landmark: document.getElementById("landmark").value.trim(),
        instructions: document.getElementById("instructions").value.trim()
    };

    if (
        !customer.name ||
        !customer.phone ||
        !customer.email ||
        !customer.address ||
        !customer.city
    ) {
        alert("Please complete all required delivery details.");
        return;
    }

    const payment =
        document.querySelector('input[name="payment"]:checked')?.value;

    if (payment === "online") {
        alert("Online payment is coming soon. Please select Cash on Delivery.");
        return;
    }

    const totals = calculateTotals();

    const order = {
        id: "KWQ" + Date.now().toString().slice(-8),

        restaurant: cart[0].restaurantName,

        customer,

        items: cart,

        subtotal: totals.subtotal,
        deliveryFee: totals.delivery,
        serviceFee: totals.service,
        total: totals.total,

        paymentMethod: payment || "cash",

        status: "Order placed",

        statusHistory: [
            {
                status: "Order placed",
                timestamp: new Date().toISOString()
            }
        ],

        createdAt: new Date().toISOString()
    };

    saveDeliveryAddress(customer);

    const orders = getStorage(ORDERS_KEY, []);

    orders.push(order);

    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

    localStorage.setItem(
        "kwiQeatLatestOrder",
        JSON.stringify(order)
    );

    localStorage.removeItem(CART_KEY);

    window.location.href = "order-success.html";

});


// ---------- INITIALIZE ----------

if (!cart.length) {
    alert("Your cart is empty.");
    window.location.href = "cart.html";
} else {

    renderCheckoutSummary();
    renderSavedAddresses();

    if (account) {
        document.getElementById("fullName").value = account.name || "";
        document.getElementById("phone").value = account.phone || "";
        document.getElementById("email").value = account.email || "";
    }

}
