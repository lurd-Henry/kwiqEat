// ==========================================
// KWIQEAT ACCOUNT SYSTEM
// Backend Authentication Integration
// ==========================================

const API_URL = "https://kwiqeat-api.onrender.com";

const TOKEN_KEY = "kwiQeatToken";

const authSection = document.getElementById("authSection");
const dashboardSection = document.getElementById("dashboardSection");

const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const authSubmit = document.getElementById("authSubmit");
const authMessage = document.getElementById("authMessage");

let authMode = "login";
let currentUser = null;

// ==========================================
// INITIAL SETUP
// ==========================================

document.getElementById("year").textContent =
    new Date().getFullYear();


// ==========================================
// API HELPER
// ==========================================

async function apiRequest(endpoint, options = {}) {

    const token = localStorage.getItem(TOKEN_KEY);

    const headers = {
        ...(options.headers || {})
    };

    if (!(options.body instanceof FormData) && options.body) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response;

    try {

        response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

    } catch (error) {

        throw new Error(
            "Unable to connect to kwiQeat. Please check your internet connection."
        );

    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {

        if (response.status === 401 && token) {
            logout(false);
        }

        throw new Error(
            data.message || "Something went wrong. Please try again."
        );

    }

    return data;

}


// ==========================================
// AUTH MODE
// ==========================================

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


// ==========================================
// LOGIN / REGISTRATION
// ==========================================

authForm.addEventListener("submit", async event => {

    event.preventDefault();

    const email = document.getElementById("authEmail")
        .value.trim().toLowerCase();

    const password = document.getElementById("authPassword").value;

    authMessage.textContent = "";

    authSubmit.disabled = true;

    authSubmit.textContent = "Please wait...";

    try {

        let endpoint;
        let payload;

        if (authMode === "register") {

            const full_name = document.getElementById("authName")
                .value.trim();

            const phone = document.getElementById("authPhone")
                .value.trim();

            if (!full_name || !phone) {
                throw new Error("Please complete all required fields.");
            }

            endpoint = "/api/auth/register";

            payload = {
                full_name,
                email,
                phone,
                password
            };

        } else {

            endpoint = "/api/auth/login";

            payload = {
                email,
                password
            };

        }

        const data = await apiRequest(endpoint, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        if (!data.token) {
            throw new Error("Authentication token was not returned.");
        }

        localStorage.setItem(TOKEN_KEY, data.token);

        currentUser = data.user;

        await loadDashboard();

        authForm.reset();

    } catch (error) {

        authMessage.textContent = error.message;

    } finally {

        authSubmit.disabled = false;

        authSubmit.textContent = authMode === "register"
            ? "Create Account"
            : "Login";

    }

});


// ==========================================
// VERIFY SESSION WITH BACKEND
// ==========================================

async function verifySession() {

    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {

        showLogin();

        return;

    }

    try {

        const data = await apiRequest("/api/auth/me");

        currentUser = data.user;

        await loadDashboard();

    } catch (error) {

        localStorage.removeItem(TOKEN_KEY);

        showLogin();

    }

}


// ==========================================
// LOAD DASHBOARD
// ==========================================

async function loadDashboard() {

    if (!currentUser) {
        showLogin();
        return;
    }

    authSection.classList.add("hidden");

    dashboardSection.classList.remove("hidden");

    const name = currentUser.full_name || "Customer";

    document.getElementById("welcomeName").textContent =
        name.split(" ")[0];

    document.getElementById("profileName").value = name;

    document.getElementById("profileEmail").value =
        currentUser.email || "";

    document.getElementById("profilePhone").value =
        currentUser.phone || "";

    document.getElementById("settingsEmail").textContent =
        currentUser.email || "";

    renderAddresses();

    await renderOrders();

}


// ==========================================
// SHOW LOGIN
// ==========================================

function showLogin() {

    currentUser = null;

    dashboardSection.classList.add("hidden");

    authSection.classList.remove("hidden");

}


// ==========================================
// LOGOUT
// ==========================================

function logout(showMessage = true) {

    localStorage.removeItem(TOKEN_KEY);

    currentUser = null;

    showLogin();

    authForm.reset();

    setAuthMode("login");

    if (showMessage) {
        alert("You have been logged out.");
    }

}


document.getElementById("logoutBtn")
    .addEventListener("click", () => logout());


// ==========================================
// DASHBOARD NAVIGATION
// ==========================================

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


// ==========================================
// PROFILE
// ==========================================

// Profile updates are not yet connected to a backend
// PUT endpoint. Do not save fake changes locally.

document.getElementById("profileForm")
    .addEventListener("submit", event => {

        event.preventDefault();

        showMessage(
            "profileMessage",
            "Profile editing will be available soon."
        );

    });


// ==========================================
// SAVED ADDRESSES
// TEMPORARILY BROWSER-LOCAL
// ==========================================

function getAddressKey() {

    return `kwiQeatAddresses_${currentUser.id}`;

}


function getAddresses() {

    try {

        return JSON.parse(
            localStorage.getItem(getAddressKey())
        ) || [];

    } catch {

        return [];

    }

}


function saveAddresses(addresses) {

    localStorage.setItem(
        getAddressKey(),
        JSON.stringify(addresses)
    );

}


document.getElementById("addressForm")
    .addEventListener("submit", event => {

        event.preventDefault();

        const address = {

            id: Date.now(),

            label: document.getElementById("addressLabel")
                .value.trim(),

            street: document.getElementById("addressStreet")
                .value.trim(),

            city: document.getElementById("addressCity")
                .value.trim(),

            landmark: document.getElementById("addressLandmark")
                .value.trim()

        };

        const addresses = getAddresses();

        addresses.push(address);

        saveAddresses(addresses);

        event.target.reset();

        renderAddresses();

    });


function renderAddresses() {

    const container = document.getElementById("savedAddresses");

    const addresses = getAddresses();

    container.innerHTML = "";

    if (!addresses.length) {

        container.textContent =
            "You haven't saved any addresses yet.";

        return;

    }

    addresses.forEach(address => {

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

            const updated = getAddresses().filter(
                item => item.id !== address.id
            );

            saveAddresses(updated);

            renderAddresses();

        });

        card.append(title, location, landmark, removeButton);

        container.appendChild(card);

    });

}


// ==========================================
// ORDER HISTORY
// CONNECTED TO BACKEND
// ==========================================

async function renderOrders() {

    const container = document.getElementById("orderHistory");

    container.innerHTML = "Loading orders...";

    try {

        const data = await apiRequest("/api/orders/my-orders");

        const orders = data.orders || [];

        container.innerHTML = "";

        if (!orders.length) {

            container.textContent =
                "You haven't placed any orders yet.";

            return;

        }

        orders.forEach(order => {

            const card = document.createElement("div");

            card.className = "order-history-card";

            const title = document.createElement("h3");

            title.textContent =
                `Order #${order.order_number}`;

            const date = document.createElement("p");

            date.textContent = new Date(
                order.created_at
            ).toLocaleString();

            const restaurant = document.createElement("p");

            restaurant.textContent = order.restaurant_name;

            const status = document.createElement("p");

            status.textContent =
                "Status: " + order.status.replace(/_/g, " ");

            const total = document.createElement("strong");

            total.textContent =
                `₦${Number(order.total).toLocaleString()}`;

            card.append(
                title,
                date,
                restaurant,
                status,
                total
            );

            container.appendChild(card);

        });

    } catch (error) {

        container.textContent = error.message;

    }

}


// ==========================================
// ACCOUNT DELETION
// NOT YET SUPPORTED BY BACKEND
// ==========================================

document.getElementById("deleteAccountBtn")
    .addEventListener("click", () => {

        alert(
            "Account deletion is not yet available. Please contact kwiQeat support."
        );

    });


// ==========================================
// HELPERS
// ==========================================

function showMessage(elementId, message) {

    const element = document.getElementById(elementId);

    element.textContent = message;

    setTimeout(() => {

        element.textContent = "";

    }, 3000);

}


// ==========================================
// INITIAL LOAD
// ==========================================

verifySession();
