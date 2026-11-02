// ===================================
// KWIQEAT SHOPPING CART
// ===================================

const CART_KEY = "kwiqEatCart";

const DELIVERY_FEE = 500;
const SERVICE_FEE_RATE = 0.03;

const cartItems = document.getElementById("cartItems");

function getCart() {
    try {
        const cart = JSON.parse(localStorage.getItem(CART_KEY));

        return Array.isArray(cart) ? cart : [];

    } catch {
        return [];
    }
}


function saveCart(cart) {

    localStorage.setItem(CART_KEY, JSON.stringify(cart));

    renderCart();
}


function formatCurrency(amount) {

    return "₦" + Number(amount).toLocaleString("en-NG");
}


// ===================================
// RENDER CART
// ===================================

function renderCart() {

    const cart = getCart();

    if (!cart.length) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <div class="empty-cart-icon">🛒</div>

                <h3>Your cart is feeling lonely.</h3>

                <p>You haven't added any delicious meals yet.</p>

                <a href="index.html#restaurants" class="empty-cart-btn">
                    Explore restaurants
                </a>

            </div>

        `;

        updateSummary(0);

        document.getElementById("clearCart").disabled = true;
        document.getElementById("checkoutBtn").disabled = true;

        return;
    }


    document.getElementById("clearCart").disabled = false;
    document.getElementById("checkoutBtn").disabled = false;


    const restaurantName = cart[0].restaurantName || "Restaurant";

    cartItems.innerHTML = `

        <div class="cart-restaurant">

            <span>🍽️</span>

            <div>
                <strong>${restaurantName}</strong>
                <small>${cart.length} different meal(s)</small>
            </div>

        </div>

        ${cart.map(item => `

            <div class="cart-item">

                <img src="${item.image}" alt="${item.name}">

                <div class="cart-item-info">

                    <h3>${item.name}</h3>

                    <p>${formatCurrency(item.price)}</p>

                    <div class="quantity-control">

                        <button onclick="changeQuantity(${item.id}, -1)">
                            −
                        </button>

                        <span>${item.quantity}</span>

                        <button onclick="changeQuantity(${item.id}, 1)">
                            +
                        </button>

                    </div>

                </div>

                <div class="cart-item-right">

                    <strong>
                        ${formatCurrency(item.price * item.quantity)}
                    </strong>

                    <button
                        class="remove-item"
                        onclick="removeItem(${item.id})"
                    >
                        Remove
                    </button>

                </div>

            </div>

        `).join("")}

    `;


    const subtotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    updateSummary(subtotal);

}


// ===================================
// SUMMARY
// ===================================

function updateSummary(subtotal) {

    const delivery = subtotal > 0 ? DELIVERY_FEE : 0;

    const service = subtotal > 0
        ? Math.round(subtotal * SERVICE_FEE_RATE)
        : 0;

    const total = subtotal + delivery + service;

    document.getElementById("subtotal").textContent =
        formatCurrency(subtotal);

    document.getElementById("deliveryFee").textContent =
        formatCurrency(delivery);

    document.getElementById("serviceFee").textContent =
        formatCurrency(service);

    document.getElementById("grandTotal").textContent =
        formatCurrency(total);

}


// ===================================
// QUANTITY CONTROLS
// ===================================

function changeQuantity(id, change) {

    const cart = getCart();

    const item = cart.find(product => product.id === id);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {

        removeItem(id);

        return;

    }

    saveCart(cart);

}


// ===================================
// REMOVE ITEM
// ===================================

function removeItem(id) {

    const cart = getCart();

    const updatedCart = cart.filter(item => item.id !== id);

    saveCart(updatedCart);

    showToast("Item removed from cart.");

}


// ===================================
// CLEAR CART
// ===================================

document.getElementById("clearCart").addEventListener("click", () => {

    if (!getCart().length) return;

    if (!confirm("Are you sure you want to clear your cart?")) return;

    localStorage.removeItem(CART_KEY);

    renderCart();

    showToast("Your cart has been cleared.");

});


// ===================================
// CHECKOUT
// ===================================

document.getElementById("checkoutBtn").addEventListener("click", () => {

    if (!getCart().length) return;

    window.location.href = "checkout.html";

});


// ===================================
// TOAST
// ===================================

let toastTimer;

function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


// ===================================
// INITIALIZE
// ===================================

document.getElementById("year").textContent =
    new Date().getFullYear();

renderCart();
