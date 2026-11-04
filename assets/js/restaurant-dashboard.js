// =============================================
// KWIQEAT RESTAURANT DASHBOARD
// Live API Integration
// =============================================

const API_URL = "https://kwiqeat-api.onrender.com";
const TOKEN_KEY = "kwiQeatToken";

const token = localStorage.getItem(TOKEN_KEY);

let currentUser = null;
let currentRestaurant = null;
let restaurantOrders = [];
let restaurantMenu = [];
let editingFoodId = null;
let isRestaurantApproved = false;


// =============================================
// DOM ELEMENTS
// =============================================

const $ = (id) => document.getElementById(id);

const connectionStatus = $("connectionStatus");
const restaurantName = $("restaurantName");

const approvalNotice = $("restaurantApprovalNotice");
const approvalTitle = $("approvalTitle");
const approvalMessage = $("approvalMessage");

const availabilityToggle = $("restaurantAvailabilityToggle");

const foodModal = $("foodModal");
const foodForm = $("foodForm");
const foodImage = $("foodImage");

const toastElement = $("dashboardToast");


// =============================================
// UTILITIES
// =============================================

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}


function formatMoney(amount) {
    const value = Number(amount);

    return "₦" + (Number.isFinite(value) ? value : 0)
        .toLocaleString("en-NG", {
            maximumFractionDigits: 2
        });
}


function formatDate(date) {
    if (!date) return "N/A";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "N/A";

    return parsed.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


function formatStatus(status) {
    const statuses = {
        order_placed: "Order placed",
        order_confirmed: "Confirmed",
        preparing: "Preparing",
        out_for_delivery: "Out for delivery",
        delivered: "Delivered",
        cancelled: "Cancelled"
    };

    return statuses[status] || status || "Unknown";
}


function showToast(message, type = "success") {
    if (!toastElement) return;

    toastElement.textContent = message;

    toastElement.classList.remove("success", "error");
    toastElement.classList.add(type);

    toastElement.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toastElement.classList.remove("show");
    }, 3500);
}


function setConnectionStatus(message, connected = true) {
    if (!connectionStatus) return;

    connectionStatus.textContent = message;

    connectionStatus.style.color = connected
        ? "#16a34a"
        : "#dc2626";
}


// =============================================
// API REQUEST
// =============================================

async function apiRequest(endpoint, options = {}) {

    const headers = {
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    if (
        options.body &&
        !(options.body instanceof FormData)
    ) {
        headers["Content-Type"] = "application/json";
    }

    let response;

    try {

        response = await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,
                headers
            }
        );

    } catch (error) {

        setConnectionStatus("● Connection failed", false);

        throw new Error(
            "Unable to connect to kwiQeat. Check your internet connection."
        );

    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {

        if (response.status === 401) {
            localStorage.removeItem(TOKEN_KEY);

            window.location.href = "account.html";
        }

        throw new Error(
            data.message || "Something went wrong."
        );

    }

    return data;
}


// =============================================
// AUTHENTICATION
// =============================================

async function verifyAuthentication() {

    if (!token) {

        window.location.href = "account.html";
        return false;

    }

    try {

        const data = await apiRequest("/api/auth/me");

        currentUser = data.user;

        if (!currentUser || currentUser.role !== "restaurant") {

            showToast(
                "You do not have permission to access this dashboard.",
                "error"
            );

            localStorage.removeItem(TOKEN_KEY);

            window.location.href = "account.html";

            return false;

        }

        return true;

    } catch (error) {

        console.error("Authentication error:", error);

        showToast(error.message, "error");

        return false;

    }

}


// =============================================
// LOAD RESTAURANT PROFILE
// =============================================

async function loadRestaurantProfile() {

    const data = await apiRequest(
        "/api/restaurants/my-restaurant"
    );

    currentRestaurant = data.restaurant;

    if (!currentRestaurant) {
        throw new Error("Restaurant profile not found.");
    }

    restaurantName.textContent = currentRestaurant.name;

    $("settingRestaurantName").value =
        currentRestaurant.name || "";

    $("settingRestaurantPhone").value =
        currentRestaurant.phone || "";

    $("settingRestaurantDescription").value =
        currentRestaurant.description || "";

    $("settingRestaurantAddress").value =
        currentRestaurant.address || "";

    $("settingRestaurantCity").value =
        currentRestaurant.city || "";

    $("settingRestaurantState").value =
        currentRestaurant.state || "";

    isRestaurantApproved =
        currentRestaurant.status === "active";

    updateApprovalDisplay();

    updateAvailabilityDisplay();

    return currentRestaurant;

}


// =============================================
// RESTAURANT APPROVAL
// =============================================

function updateApprovalDisplay() {

    if (!currentRestaurant) return;

    const status = currentRestaurant.status;

    if (status === "active") {

        approvalNotice.hidden = true;

        return;

    }

    approvalNotice.hidden = false;

    if (status === "pending") {

        approvalTitle.textContent =
            "Application Pending ⏳";

        approvalMessage.textContent =
            "Your restaurant registration has been received. Our team will review your application before activating your restaurant.";

    } else if (status === "rejected") {

        approvalTitle.textContent =
            "Application Rejected";

        approvalMessage.textContent =
            "Your restaurant application was not approved. Please contact kwiQeat support for assistance.";

    } else {

        approvalTitle.textContent =
            "Restaurant Suspended";

        approvalMessage.textContent =
            "Your restaurant account is currently suspended. Please contact kwiQeat support.";

    }

    // Prevent access to restricted actions.

    $("addFoodBtn").disabled = !isRestaurantApproved;

    availabilityToggle.disabled = !isRestaurantApproved;

    $("saveRestaurantSettings").disabled = false;

}


// =============================================
// RESTAURANT AVAILABILITY
// =============================================

function updateAvailabilityDisplay() {

    if (!currentRestaurant) return;

    const isOpen = currentRestaurant.is_open === true;

    availabilityToggle.textContent = isOpen
        ? "● Open"
        : "● Closed";

    availabilityToggle.style.background = isOpen
        ? "#16a34a"
        : "#64748b";

    availabilityToggle.disabled = !isRestaurantApproved;

}


async function toggleAvailability() {

    if (!isRestaurantApproved) return;

    const newStatus = currentRestaurant.is_open !== true;

    availabilityToggle.disabled = true;

    try {

        const data = await apiRequest(
            "/api/restaurants/my-restaurant/availability",
            {
                method: "PATCH",
                body: JSON.stringify({
                    is_open: newStatus
                })
            }
        );

        currentRestaurant.is_open =
            data.restaurant.is_open;

        updateAvailabilityDisplay();

        showToast(data.message);

    } catch (error) {

        showToast(error.message, "error");

    } finally {

        availabilityToggle.disabled = !isRestaurantApproved;

    }

}


// =============================================
// LOAD RESTAURANT ORDERS
// =============================================

async function loadOrders() {

    const data = await apiRequest(
        "/api/restaurant/orders"
    );

    restaurantOrders = data.orders || [];

    renderOrders();

    renderRecentOrders();

    updateOrderStatistics();

}


// =============================================
// ORDER STATISTICS
// =============================================

function updateOrderStatistics() {

    const total = restaurantOrders.length;

    const pending = restaurantOrders.filter(
        order => order.status === "order_placed"
    ).length;

    const completed = restaurantOrders.filter(
        order => order.status === "delivered"
    ).length;

    $("totalOrders").textContent = total;

    $("pendingOrders").textContent = pending;

    $("completedOrders").textContent = completed;

}


// =============================================
// LOAD SALES
// =============================================

async function loadSales() {

    const data = await apiRequest(
        "/api/restaurant/orders/sales/summary"
    );

    const sales = data.sales || {};

    $("totalSales").textContent =
        formatMoney(sales.completed_revenue || 0);

    const salesDescription =
        $("totalSales").parentElement.querySelector("small");

    if (salesDescription) {
        salesDescription.textContent =
            "Gross value of delivered orders";
    }

}


// =============================================
// ORDER ACTIONS
// =============================================

const orderTransitions = {

    order_placed: [
        "order_confirmed",
        "cancelled"
    ],

    order_confirmed: [
        "preparing",
        "cancelled"
    ],

    preparing: [
        "out_for_delivery",
        "cancelled"
    ],

    out_for_delivery: [
        "delivered"
    ],

    delivered: [],

    cancelled: []

};


function orderActionButtons(order) {

    const nextStatuses =
        orderTransitions[order.status] || [];

    if (!nextStatuses.length) {

        return `<span class="order-final-status">
            ${escapeHTML(formatStatus(order.status))}
        </span>`;

    }

    return nextStatuses.map(status => {

        const label = status === "cancelled"
            ? "Cancel"
            : status === "order_confirmed"
                ? "Confirm"
                : status === "preparing"
                    ? "Start preparing"
                    : status === "out_for_delivery"
                        ? "Send out"
                        : "Mark delivered";

        const style = status === "cancelled"
            ? "background:#dc2626;"
            : "";

        return `
            <button
                type="button"
                class="dashboard-primary-btn order-action-btn"
                data-order-id="${escapeHTML(order.id)}"
                data-order-status="${status}"
                style="${style}"
            >
                ${label}
            </button>
        `;

    }).join("");

}


async function updateOrderStatus(orderId, status) {

    const confirmed = confirm(
        `Are you sure you want to change this order to "${formatStatus(status)}"?`
    );

    if (!confirmed) return;

    try {

        const data = await apiRequest(
            `/api/restaurant/orders/${encodeURIComponent(orderId)}/status`,
            {
                method: "PATCH",
                body: JSON.stringify({
                    status
                })
            }
        );

        showToast(data.message);

        await Promise.all([
            loadOrders(),
            loadSales()
        ]);

    } catch (error) {

        showToast(error.message, "error");

    }

}


// =============================================
// RENDER RECENT ORDERS
// =============================================

function renderRecentOrders() {

    const table = $("recentOrdersTable");
    const empty = $("recentOrdersEmpty");

    if (!restaurantOrders.length) {

        table.innerHTML = "";

        empty.style.display = "block";

        return;

    }

    empty.style.display = "none";

    const recent = restaurantOrders.slice(0, 5);

    table.innerHTML = recent.map(order => `

        <tr>

            <td>
                #${escapeHTML(order.order_number || order.id.slice(0, 8))}
            </td>

            <td>
                ${escapeHTML(order.customer_name || "Customer")}
            </td>

            <td>
                ${formatMoney(order.total)}
            </td>

            <td>
                <span class="order-status status-${escapeHTML(order.status)}">
                    ${escapeHTML(formatStatus(order.status))}
                </span>
            </td>

            <td>
                ${orderActionButtons(order)}
            </td>

        </tr>

    `).join("");

}


// =============================================
// RENDER ALL ORDERS
// =============================================

function renderOrders() {

    const container = $("allOrdersContainer");
    const empty = $("allOrdersEmpty");

    const filter = $("orderFilter").value;

    const filteredOrders = restaurantOrders.filter(order => {

        return filter === "all" || order.status === filter;

    });

    if (!filteredOrders.length) {

        container.innerHTML = "";

        empty.style.display = "block";

        return;

    }

    empty.style.display = "none";

    container.innerHTML = filteredOrders.map(order => {

        const orderId =
            order.order_number || order.id.slice(0, 8);

        return `

            <div class="dashboard-panel order-card">

                <div class="panel-heading">

                    <div>

                        <h3>
                            Order #${escapeHTML(orderId)}
                        </h3>

                        <p>
                            ${escapeHTML(order.customer_name || "Customer")}
                        </p>

                    </div>

                    <span class="order-status status-${escapeHTML(order.status)}">
                        ${escapeHTML(formatStatus(order.status))}
                    </span>

                </div>

                <div class="order-details">

                    <p>
                        <strong>Order Amount:</strong>
                        ${formatMoney(order.total)}
                    </p>

                    <p>
                        <strong>Payment:</strong>
                        ${escapeHTML(order.payment_method || "N/A")}
                    </p>

                    <p>
                        <strong>Payment Status:</strong>
                        ${escapeHTML(order.payment_status || "N/A")}
                    </p>

                    <p>
                        <strong>Date:</strong>
                        ${formatDate(order.created_at)}
                    </p>

                    <p>
                        <strong>Delivery Address:</strong>
                        ${escapeHTML(order.delivery_address || "Not provided")}
                    </p>

                </div>

                <div class="order-actions">

                    ${orderActionButtons(order)}

                </div>

            </div>

        `;

    }).join("");

}


// =============================================
// ORDER FILTER
// =============================================

$("orderFilter").addEventListener("change", () => {

    const selected = $("orderFilter").value;

    const statusMap = {

        "all": "all",

        "Order placed": "order_placed",

        "Order confirmed": "order_confirmed",

        "Preparing your food": "preparing",

        "Out for delivery": "out_for_delivery",

        "Delivered": "delivered",

        "Cancelled": "cancelled"

    };

    $("orderFilter").dataset.status =
        statusMap[selected] || selected;

    renderOrdersWithFilter();

});


function renderOrdersWithFilter() {

    const filter = $("orderFilter").dataset.status || "all";

    const container = $("allOrdersContainer");
    const empty = $("allOrdersEmpty");

    const filteredOrders = restaurantOrders.filter(order => {

        return filter === "all" || order.status === filter;

    });

    if (!filteredOrders.length) {

        container.innerHTML = "";

        empty.style.display = "block";

        return;

    }

    empty.style.display = "none";

    container.innerHTML = filteredOrders.map(order => `

        <div class="dashboard-panel order-card">

            <div class="panel-heading">

                <div>

                    <h3>
                        Order #${escapeHTML(order.order_number || order.id.slice(0, 8))}
                    </h3>

                    <p>
                        ${escapeHTML(order.customer_name || "Customer")}
                    </p>

                </div>

                <span class="order-status status-${escapeHTML(order.status)}">
                    ${escapeHTML(formatStatus(order.status))}
                </span>

            </div>

            <div class="order-details">

                <p><strong>Amount:</strong> ${formatMoney(order.total)}</p>

                <p><strong>Payment:</strong> ${escapeHTML(order.payment_method || "N/A")}</p>

                <p><strong>Date:</strong> ${formatDate(order.created_at)}</p>

                <p><strong>Delivery:</strong> ${escapeHTML(order.delivery_address || "Not provided")}</p>

            </div>

            <div class="order-actions">

                ${orderActionButtons(order)}

            </div>

        </div>

    `).join("");

}


// =============================================
// LOAD MENU
// =============================================

async function loadMenu() {

    const data = await apiRequest("/api/menu");

    restaurantMenu = data.foods || [];

    renderMenu();

}


// =============================================
// RENDER MENU
// =============================================

function renderMenu() {

    const grid = $("menuManagerGrid");
    const empty = $("menuEmpty");

    if (!restaurantMenu.length) {

        grid.innerHTML = "";

        empty.style.display = "block";

        return;

    }

    empty.style.display = "none";

    grid.innerHTML = restaurantMenu.map(food => `

        <div class="menu-manager-card">

            <div class="menu-manager-image">

                ${
                    food.image
                        ? `<img
                            src="${escapeHTML(food.image)}"
                            alt="${escapeHTML(food.name)}"
                            loading="lazy"
                        >`
                        : `<div class="menu-placeholder">🍽️</div>`
                }

            </div>

            <div class="menu-manager-content">

                <h3>${escapeHTML(food.name)}</h3>

                <p>${escapeHTML(food.description || "No description")}</p>

                <strong>${formatMoney(food.price)}</strong>

                <small>
                    ${escapeHTML(food.category_name || "Uncategorized")}
                </small>

                <span class="food-availability">
                    ${food.is_available ? "Available" : "Unavailable"}
                </span>

                <div class="menu-card-actions">

                    <button
                        type="button"
                        class="dashboard-primary-btn edit-food-btn"
                        data-food-id="${escapeHTML(food.id)}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="dashboard-primary-btn toggle-food-btn"
                        data-food-id="${escapeHTML(food.id)}"
                        data-available="${food.is_available}"
                    >
                        ${food.is_available ? "Disable" : "Enable"}
                    </button>

                    <button
                        type="button"
                        class="dashboard-primary-btn delete-food-btn"
                        data-food-id="${escapeHTML(food.id)}"
                        style="background:#dc2626;"
                    >
                        Delete
                    </button>

                </div>

            </div>

        </div>

    `).join("");

}


// =============================================
// FOOD MODAL
// =============================================

function openFoodModal(food = null) {

    if (!isRestaurantApproved) {

        showToast(
            "Your restaurant must be approved first.",
            "error"
        );

        return;

    }

    foodForm.reset();

    editingFoodId = food ? food.id : null;

    $("foodId").value = food ? food.id : "";

    $("foodModalTitle").textContent = food
        ? "Edit Meal"
        : "Add New Meal";

    $("foodName").value = food?.name || "";

    $("foodDescription").value =
        food?.description || "";

    $("foodPrice").value = food?.price || "";

    $("foodImagePreview").innerHTML =
        food?.image
            ? `<img
                src="${escapeHTML(food.image)}"
                alt="Current food image"
                style="width:120px;height:100px;object-fit:cover;border-radius:10px;"
            >`
            : "";

    foodModal.classList.add("active");

}


function closeFoodModal() {

    foodModal.classList.remove("active");

    foodForm.reset();

    editingFoodId = null;

    $("foodImagePreview").innerHTML = "";

}


// =============================================
// FOOD IMAGE PREVIEW
// =============================================

foodImage.addEventListener("change", () => {

    const file = foodImage.files[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {

        showToast("Please select a JPG, PNG or WEBP image.", "error");

        foodImage.value = "";

        return;

    }

    if (file.size > 5 * 1024 * 1024) {

        showToast("Image must not exceed 5MB.", "error");

        foodImage.value = "";

        return;

    }

    const preview = $("foodImagePreview");

    const imageURL = URL.createObjectURL(file);

    preview.innerHTML = `
        <img
            src="${imageURL}"
            alt="Food image preview"
            style="width:120px;height:100px;object-fit:cover;border-radius:10px;"
        >
    `;

    const image = preview.querySelector("img");

    image.addEventListener("load", () => {
        URL.revokeObjectURL(imageURL);
    }, { once: true });

});


// =============================================
// SAVE FOOD
// =============================================

foodForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!isRestaurantApproved) return;

    const name = $("foodName").value.trim();

    const description = $("foodDescription").value.trim();

    const price = Number($("foodPrice").value);

    const file = foodImage.files[0];

    if (!name || !Number.isFinite(price) || price < 0) {

        showToast("Enter a valid meal name and price.", "error");

        return;

    }

    if (file && file.size > 5 * 1024 * 1024) {

        showToast("Image must not exceed 5MB.", "error");

        return;

    }

    const formData = new FormData();

    formData.append("name", name);

    formData.append("description", description);

    formData.append("price", price);

    if (!editingFoodId) {
        formData.append("is_featured", "false");
    }

    if (file) {
        formData.append("image", file);
    }

    const submitButton =
        foodForm.querySelector('button[type="submit"]');

    submitButton.disabled = true;

    submitButton.textContent = "Saving...";

    try {

        const endpoint = editingFoodId
            ? `/api/menu/${encodeURIComponent(editingFoodId)}`
            : "/api/menu";

        const data = await apiRequest(
            endpoint,
            {
                method: editingFoodId ? "PUT" : "POST",
                body: formData
            }
        );

        showToast(data.message || "Meal saved successfully.");

        closeFoodModal();

        await loadMenu();

    } catch (error) {

        showToast(error.message, "error");

    } finally {

        submitButton.disabled = false;

        submitButton.textContent = "Save Meal";

    }

});


// =============================================
// EDIT FOOD
// =============================================

async function editFood(foodId) {

    const food = restaurantMenu.find(
        item => item.id === foodId
    );

    if (!food) return;

    openFoodModal(food);

}


// =============================================
// TOGGLE FOOD AVAILABILITY
// =============================================

async function toggleFoodAvailability(foodId, available) {

    try {

        const formData = new FormData();

        formData.append(
            "is_available",
            String(!available)
        );

        const data = await apiRequest(
            `/api/menu/${encodeURIComponent(foodId)}`,
            {
                method: "PUT",
                body: formData
            }
        );

        showToast(data.message);

        await loadMenu();

    } catch (error) {

        showToast(error.message, "error");

    }

}


// =============================================
// DELETE FOOD
// =============================================

async function deleteFood(foodId) {

    const confirmed = confirm(
        "Are you sure you want to delete this meal?"
    );

    if (!confirmed) return;

    try {

        const data = await apiRequest(
            `/api/menu/${encodeURIComponent(foodId)}`,
            {
                method: "DELETE"
            }
        );

        showToast(data.message);

        await loadMenu();

    } catch (error) {

        showToast(error.message, "error");

    }

}


// =============================================
// RESTAURANT SETTINGS
// =============================================

async function saveRestaurantSettings() {

    const payload = {

        name: $("settingRestaurantName").value.trim(),

        phone: $("settingRestaurantPhone").value.trim(),

        description: $("settingRestaurantDescription").value.trim(),

        address: $("settingRestaurantAddress").value.trim(),

        city: $("settingRestaurantCity").value.trim(),

        state: $("settingRestaurantState").value.trim()

    };

    if (!payload.name || !payload.address) {

        showToast(
            "Restaurant name and address are required.",
            "error"
        );

        return;

    }

    const button = $("saveRestaurantSettings");

    button.disabled = true;

    button.textContent = "Saving...";

    try {

        const data = await apiRequest(
            "/api/restaurants/my-restaurant",
            {
                method: "PUT",
                body: JSON.stringify(payload)
            }
        );

        currentRestaurant = data.restaurant;

        restaurantName.textContent =
            currentRestaurant.name;

        showToast(data.message);

    } catch (error) {

        showToast(error.message, "error");

    } finally {

        button.disabled = false;

        button.textContent = "Save Changes";

    }

}


// =============================================
// DASHBOARD NAVIGATION
// =============================================

function initializeNavigation() {

    const navLinks = document.querySelectorAll(
        ".dashboard-nav a[data-section]"
    );

    const sections = document.querySelectorAll(
        ".dashboard-section"
    );

    navLinks.forEach(link => {

        link.addEventListener("click", event => {

            event.preventDefault();

            const target = link.dataset.section;

            navLinks.forEach(item =>
                item.classList.remove("active")
            );

            sections.forEach(section =>
                section.classList.remove("active")
            );

            link.classList.add("active");

            const targetSection = $(target);

            if (targetSection) {
                targetSection.classList.add("active");
            }

            $("dashboardHeading").textContent =
                link.textContent.trim().replace(/^[^\w]+/, "");

            $("dashboardSidebar").classList.remove("active");

        });

    });


    document.querySelectorAll("[data-target]").forEach(button => {

        button.addEventListener("click", () => {

            const target = button.dataset.target;

            const targetLink = document.querySelector(
                `.dashboard-nav a[data-section="${target}"]`
            );

            if (targetLink) targetLink.click();

        });

    });


    $("dashboardMenuToggle").addEventListener("click", () => {

        $("dashboardSidebar").classList.toggle("active");

    });

}


// =============================================
// EVENT DELEGATION
// =============================================

document.addEventListener("click", event => {

    const orderButton = event.target.closest(".order-action-btn");

    if (orderButton) {

        updateOrderStatus(
            orderButton.dataset.orderId,
            orderButton.dataset.orderStatus
        );

        return;

    }


    const editButton = event.target.closest(".edit-food-btn");

    if (editButton) {

        editFood(editButton.dataset.foodId);

        return;

    }


    const toggleButton = event.target.closest(".toggle-food-btn");

    if (toggleButton) {

        toggleFoodAvailability(
            toggleButton.dataset.foodId,
            toggleButton.dataset.available === "true"
        );

        return;

    }


    const deleteButton = event.target.closest(".delete-food-btn");

    if (deleteButton) {

        deleteFood(deleteButton.dataset.foodId);

    }

});


// =============================================
// LOGOUT
// =============================================

$("restaurantLogout").addEventListener("click", () => {

    const confirmed = confirm(
        "Are you sure you want to log out?"
    );

    if (!confirmed) return;

    localStorage.removeItem(TOKEN_KEY);

    window.location.href = "account.html";

});


// =============================================
// EVENT LISTENERS
// =============================================

$("addFoodBtn").addEventListener("click", () => {

    openFoodModal();

});


$("closeFoodModal").addEventListener("click", closeFoodModal);


foodModal.addEventListener("click", event => {

    if (event.target === foodModal) {
        closeFoodModal();
    }

});


availabilityToggle.addEventListener(
    "click",
    toggleAvailability
);


$("saveRestaurantSettings").addEventListener(
    "click",
    saveRestaurantSettings
);


// =============================================
// INITIALIZE DASHBOARD
// =============================================

async function initializeDashboard() {

    try {

        initializeNavigation();

        if (!(await verifyAuthentication())) {
            return;
        }

        setConnectionStatus("● Connected");

        // Always load the profile first.
        // Approval status determines which other APIs are safe to call.

        await loadRestaurantProfile();

        if (!isRestaurantApproved) {

            setConnectionStatus("● Awaiting approval");

            // Pending restaurants can see their profile,
            // but cannot manage menus or orders.

            $("totalOrders").textContent = "—";
            $("pendingOrders").textContent = "—";
            $("completedOrders").textContent = "—";
            $("totalSales").textContent = "—";

            $("recentOrdersEmpty").style.display = "block";
            $("allOrdersEmpty").style.display = "block";
            $("menuEmpty").style.display = "block";

            $("recentOrdersEmpty").querySelector("p").textContent =
                "Order management becomes available after approval.";

            $("allOrdersEmpty").querySelector("p").textContent =
                "Your restaurant must be approved before managing orders.";

            $("menuEmpty").querySelector("p").textContent =
                "Your menu becomes available after restaurant approval.";

            return;

        }

        // Load live dashboard data.

        const results = await Promise.allSettled([

            loadOrders(),

            loadSales(),

            loadMenu()

        ]);

        const failed = results.filter(
            result => result.status === "rejected"
        );

        failed.forEach(result => {
            console.error(
                "Dashboard data loading error:",
                result.reason
            );
        });

        if (failed.length) {

            setConnectionStatus(
                "● Partially connected",
                false
            );

            showToast(
                "Some dashboard information could not be loaded. Please refresh.",
                "error"
            );

        }

    } catch (error) {

        console.error("Dashboard initialization error:", error);

        setConnectionStatus("● Connection error", false);

        showToast(error.message, "error");

    }

}


// =============================================
// START
// =============================================

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);
