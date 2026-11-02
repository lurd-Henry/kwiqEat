const ACCOUNT_KEY = "kwiQeatAccount";
const SESSION_KEY = "kwiQeatSession";

const authSection = document.getElementById("authSection");
const dashboardSection = document.getElementById("dashboardSection");

const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const authSubmit = document.getElementById("authSubmit");
const authMessage = document.getElementById("authMessage");

let authMode = "login";

document.getElementById("year").textContent =
    new Date().getFullYear();


// ---------- STORAGE ----------

function getAccount() {
    try {
        return JSON.parse(localStorage.getItem(ACCOUNT_KEY));
    } catch {
        return null;
    }
}

function getOrders() {
    try {
        return JSON.parse(localStorage.getItem("kwiQeatOrders")) || [];
    } catch {
        return [];
    }
}

function getSession() {
    return localStorage.getItem(SESSION_KEY);
}

function saveAccount(account) {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
}


// ---------- AUTHENTICATION ----------

// This is a browser-only demonstration.
// A real authentication system must verify passwords on a backend.

async function hashPassword(password) {
    if (!window.crypto || !window.crypto.subtle) {
        throw new Error("Secure password hashing is unavailable.");
    }

    const data = new TextEncoder().encode(password);
    const hash = await crypto.subtle.digest("SHA-256", data);

    return Array.from(new Uint8Array(hash))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}


function setAuthMode(mode) {
    authMode = mode;

    const isRegister = mode === "register";

    document.getElementById("nameGroup")
        .classList.toggle("hidden", !isRegister);

    document.getElementById("phoneGroup")
        .classList.toggle("hidden", !isRegister);

    document.getElementById("loginTab")
        .classList.toggle("active", !isRegister);

    document.getElementById("registerTab")
        .classList.toggle("active", isRegister);

    authTitle.textContent = isRegister
        ? "Create Your Account"
        : "Welcome Back";

    authSubtitle.textContent = isRegister
        ? "Join kwiQeat and make ordering easier."
        : "Login to access your kwiQeat account.";

    authSubmit.textContent = isRegister
        ? "Create Account"
        : "Login";

    authMessage.textContent = "";
}


document.getElementById("loginTab").addEventListener("click", () => {
    setAuthMode("login");
});

document.getElementById("registerTab").addEventListener("click", () => {
    setAuthMode("register");
});


authForm.addEventListener("submit", async event => {
    event.preventDefault();

    const email = document.getElementById("authEmail")
        .value.trim().toLowerCase();

    const password = document.getElementById("authPassword").value;

    authMessage.textContent = "";

    try {
        const passwordHash = await hashPassword(password);

        if (authMode === "register") {

            const name = document.getElementById("authName")
                .value.trim();

            const phone = document.getElementById("authPhone")
                .value.trim();

            if (!name || !phone) {
                throw new Error("Please complete all required fields.");
            }

            if (getAccount()) {
                throw new Error(
                    "A demo account already exists in this browser. Delete it or use login."
                );
            }

            const account = {
                name,
                email,
                phone,
                passwordHash,
                addresses: [],
                createdAt: new Date().toISOString()
            };

            saveAccount(account);

            localStorage.setItem(SESSION_KEY, "active");

            showDashboard();

        } else {

            const account = getAccount();

            if (!account) {
                throw new Error("No account found. Please create one.");
            }

            if (
                account.email !== email ||
                account.passwordHash !== passwordHash
            ) {
                throw new Error("Incorrect email or password.");
            }

            localStorage.setItem(SESSION_KEY, "active");

            showDashboard();
        }

    } catch (error) {
        authMessage.textContent = error.message;
    }
});


// ---------- DASHBOARD ----------

function showDashboard() {

    const account = getAccount();

    if (!account || getSession() !== "active") {
        authSection.classList.remove("hidden");
        dashboardSection.classList.add("hidden");
        return;
    }

    authSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");

    document.getElementById("welcomeName").textContent =
        account.name.split(" ")[0];

    document.getElementById("profileName").value = account.name;
    document.getElementById("profileEmail").value = account.email;
    document.getElementById("profilePhone").value = account.phone || "";

    document.getElementById("settingsEmail").textContent =
        account.email;

    renderAddresses();
    renderOrders();
}


document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);

    dashboardSection.classList.add("hidden");
    authSection.classList.remove("hidden");

    authForm.reset();
    setAuthMode("login");
});


// ---------- DASHBOARD NAVIGATION ----------

document.querySelectorAll(".account-nav").forEach(button => {

    button.addEventListener("click", () => {

        const section = button.dataset.section;

        document.querySelectorAll(".account-nav")
            .forEach(nav => nav.classList.remove("active"));

        document.querySelectorAll(".account-panel")
            .forEach(panel => panel.classList.remove("active"));

        button.classList.add("active");

        document.getElementById(section + "Panel")
            .classList.add("active");

    });

});


// ---------- PROFILE ----------

document.getElementById("profileForm")
    .addEventListener("submit", event => {

        event.preventDefault();

        const account = getAccount();

        account.name = document.getElementById("profileName")
            .value.trim();

        account.phone = document.getElementById("profilePhone")
            .value.trim();

        saveAccount(account);

        document.getElementById("welcomeName").textContent =
            account.name.split(" ")[0];

        showMessage("profileMessage", "Profile updated successfully.");

    });


// ---------- ADDRESSES ----------

document.getElementById("addressForm")
    .addEventListener("submit", event => {

        event.preventDefault();

        const account = getAccount();

        const address = {
            id: Date.now(),
            label: document.getElementById("addressLabel").value.trim(),
            street: document.getElementById("addressStreet").value.trim(),
            city: document.getElementById("addressCity").value.trim(),
            landmark: document.getElementById("addressLandmark").value.trim()
        };

        account.addresses.push(address);

        saveAccount(account);

        event.target.reset();

        renderAddresses();

    });


function renderAddresses() {

    const container = document.getElementById("savedAddresses");
    const account = getAccount();

    container.innerHTML = "";

    if (!account.addresses || account.addresses.length === 0) {
        container.textContent = "You haven't saved any addresses yet.";
        return;
    }

    account.addresses.forEach(address => {

        const card = document.createElement("div");
        card.className = "saved-address-card";

        const title = document.createElement("h3");
        title.textContent = address.label;

        const location = document.createElement("p");
        location.textContent =
            `${address.street}, ${address.city}`;

        const landmark = document.createElement("p");
        landmark.textContent = address.landmark
            ? `Landmark: ${address.landmark}`
            : "";

        const removeButton = document.createElement("button");
        removeButton.className = "delete-btn";
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", () => {
            removeAddress(address.id);
        });

        card.append(title, location, landmark, removeButton);
        container.appendChild(card);

    });
}


function removeAddress(id) {

    const account = getAccount();

    account.addresses = account.addresses.filter(
        address => address.id !== id
    );

    saveAccount(account);

    renderAddresses();
}


// ---------- ORDER HISTORY ----------

function renderOrders() {

    const container = document.getElementById("orderHistory");
    const account = getAccount();

    const orders = getOrders().filter(order => {

        const customerEmail = order.customer?.email || "";

        return customerEmail.toLowerCase() ===
            account.email.toLowerCase();

    });

    container.innerHTML = "";

    if (orders.length === 0) {
        container.textContent = "You haven't placed any orders yet.";
        return;
    }

    orders.slice().reverse().forEach(order => {

        const card = document.createElement("div");
        card.className = "order-history-card";

        const title = document.createElement("h3");
        title.textContent = `Order #${order.orderId || "N/A"}`;

        const date = document.createElement("p");

        date.textContent = order.createdAt
            ? new Date(order.createdAt).toLocaleString()
            : "Date unavailable";

        const restaurant = document.createElement("p");

        restaurant.textContent =
            order.items?.[0]?.restaurantName || "kwiQeat Restaurant";

        const total = document.createElement("strong");

        total.textContent =
            `₦${Number(order.total || 0).toLocaleString()}`;

        const reorderButton = document.createElement("button");

        reorderButton.className = "account-primary-btn";
        reorderButton.textContent = "Reorder";

        reorderButton.addEventListener("click", () => {
            reorder(order);
        });

        card.append(title, date, restaurant, total, reorderButton);

        container.appendChild(card);

    });
}


// ---------- REORDER ----------

function reorder(order) {

    if (!order.items || order.items.length === 0) {
        alert("This order has no items to reorder.");
        return;
    }

    let cart = [];

    try {
        cart = JSON.parse(localStorage.getItem("kwiQeatCart")) || [];
    } catch {
        cart = [];
    }

    const firstRestaurant = order.items[0].restaurantId;

    if (
        cart.length > 0 &&
        String(cart[0].restaurantId) !== String(firstRestaurant)
    ) {
        const confirmClear = confirm(
            "Your cart contains items from another restaurant. Replace it with this order?"
        );

        if (!confirmClear) return;

        cart = [];
    }

    order.items.forEach(item => {

        const existing = cart.find(
            cartItem =>
                String(cartItem.id) === String(item.id) &&
                String(cartItem.restaurantId) === String(item.restaurantId)
        );

        if (existing) {
            existing.quantity += Number(item.quantity || 1);
        } else {
            cart.push({
                ...item,
                quantity: Number(item.quantity || 1)
            });
        }

    });

    localStorage.setItem("kwiQeatCart", JSON.stringify(cart));

    alert("Your previous order has been added to your cart!");

    window.location.href = "cart.html";
}


// ---------- ACCOUNT DELETION ----------

document.getElementById("deleteAccountBtn")
    .addEventListener("click", () => {

        const confirmed = confirm(
            "Are you sure you want to delete this demo account? This cannot be undone."
        );

        if (!confirmed) return;

        localStorage.removeItem(ACCOUNT_KEY);
        localStorage.removeItem(SESSION_KEY);

        authSection.classList.remove("hidden");
        dashboardSection.classList.add("hidden");

        authForm.reset();
        setAuthMode("register");

        alert("Demo account deleted.");

    });


// ---------- HELPERS ----------

function showMessage(elementId, message) {

    const element = document.getElementById(elementId);

    element.textContent = message;

    setTimeout(() => {
        element.textContent = "";
    }, 3000);

}


// ---------- INITIAL LOAD ----------

showDashboard();
