const ORDERS_KEY = "kwiQeatOrders";
const MENU_KEY = "kwiQeatRestaurantMenus";
const SETTINGS_KEY = "kwiQeatRestaurantSettings";

const defaultRestaurant = {
    name: "Mama's Kitchen",
    category: "Rice",
    deliveryTime: "20–30 mins"
};

let restaurantSettings = JSON.parse(
    localStorage.getItem(SETTINGS_KEY)
) || defaultRestaurant;

let menu = JSON.parse(
    localStorage.getItem(MENU_KEY)
) || [
    {
        id: "food1",
        name: "Jollof Rice",
        description: "Delicious Nigerian party jollof rice.",
        price: 3500,
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600",
        available: true
    },
    {
        id: "food2",
        name: "Fried Rice",
        description: "Special fried rice with vegetables.",
        price: 4000,
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600",
        available: true
    },
    {
        id: "food3",
        name: "Chicken and Chips",
        description: "Crispy chicken served with golden fries.",
        price: 5500,
        image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=600",
        available: true
    }
];

function getOrders() {
    return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
}

function saveOrders(orders) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function saveMenu() {
    localStorage.setItem(MENU_KEY, JSON.stringify(menu));
}

function money(amount) {
    return "₦" + Number(amount || 0).toLocaleString("en-NG");
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function showToast(message) {
    const toast = document.getElementById("dashboardToast");

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => toast.classList.remove("show"), 2500);
}

function getRestaurantOrders() {
    return getOrders().filter(order =>
        order.restaurant === restaurantSettings.name ||
        order.restaurantName === restaurantSettings.name
    );
}

/* NAVIGATION */

const dashboardSections = document.querySelectorAll(".dashboard-section");
const dashboardLinks = document.querySelectorAll(".dashboard-nav a");

function showSection(sectionId) {
    dashboardSections.forEach(section => {
        section.classList.toggle("active", section.id === sectionId);
    });

    dashboardLinks.forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.section === sectionId
        );
    });

    const headings = {
        overview: "Overview",
        orders: "Orders",
        menu: "Menu Management",
        settings: "Settings"
    };

    document.getElementById("dashboardHeading").textContent =
        headings[sectionId] || "Dashboard";

    document.getElementById("dashboardSidebar").classList.remove("open");

    if (sectionId === "overview") renderOverview();
    if (sectionId === "orders") renderOrders();
    if (sectionId === "menu") renderMenu();
}

dashboardLinks.forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        showSection(link.dataset.section);
    });
});

document.querySelectorAll("[data-target]").forEach(button => {
    button.addEventListener("click", () => {
        showSection(button.dataset.target);
    });
});

document.getElementById("dashboardMenuToggle").addEventListener("click", () => {
    document.getElementById("dashboardSidebar").classList.toggle("open");
});


/* OVERVIEW */

function renderOverview() {
    const orders = getRestaurantOrders();

    const completed = orders.filter(order =>
        order.status === "Delivered"
    );

    const pending = orders.filter(order =>
        order.status === "Order placed"
    );

    const sales = completed.reduce((total, order) => {
        return total + Number(order.total || 0);
    }, 0);

    document.getElementById("totalOrders").textContent = orders.length;
    document.getElementById("pendingOrders").textContent = pending.length;
    document.getElementById("completedOrders").textContent = completed.length;
    document.getElementById("totalSales").textContent = money(sales);

    const table = document.getElementById("recentOrdersTable");
    const empty = document.getElementById("recentOrdersEmpty");

    table.innerHTML = "";

    const recent = [...orders].reverse().slice(0, 5);

    empty.style.display = recent.length ? "none" : "block";

    recent.forEach(order => {
        const customer = order.customer || {};

        table.innerHTML += `
            <tr>
                <td>${escapeHTML(order.id)}</td>
                <td>${escapeHTML(customer.name || "Customer")}</td>
                <td>${money(order.total)}</td>
                <td><span class="status-badge">${escapeHTML(order.status)}</span></td>
                <td>
                    <button class="dashboard-text-btn" onclick="showSection('orders')">
                        Manage
                    </button>
                </td>
            </tr>
        `;
    });
}


/* ORDERS */

function renderOrders() {
    const container = document.getElementById("allOrdersContainer");
    const empty = document.getElementById("allOrdersEmpty");
    const filter = document.getElementById("orderFilter").value;

    let orders = [...getRestaurantOrders()].reverse();

    if (filter !== "all") {
        orders = orders.filter(order => order.status === filter);
    }

    container.innerHTML = "";
    empty.style.display = orders.length ? "none" : "block";

    orders.forEach(order => {
        const customer = order.customer || {};
        const items = order.items || [];

        const itemHTML = items.map(item => `
            <div>
                ${escapeHTML(item.name)} × ${Number(item.quantity || 1)}
            </div>
        `).join("");

        const card = document.createElement("div");
        card.className = "order-card";

        card.innerHTML = `
            <div class="order-card-header">
                <div>
                    <h3>Order #${escapeHTML(order.id)}</h3>
                    <p>${escapeHTML(customer.name || "Customer")} · ${escapeHTML(customer.phone || "No phone")}</p>
                </div>

                <span class="status-badge">${escapeHTML(order.status)}</span>
            </div>

            <div class="order-items">
                ${itemHTML || "No item details available"}
                <strong>Total: ${money(order.total)}</strong>
            </div>

            <p>Delivery address: ${escapeHTML(customer.address || "Not provided")}</p>

            <div class="order-card-footer">
                <strong>${money(order.total)}</strong>

                <select onchange="updateOrderStatus('${escapeHTML(order.id)}', this.value)">
                    <option value="">Update status</option>
                    <option value="Order confirmed">Confirm order</option>
                    <option value="Preparing your food">Preparing</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Delivered">Completed</option>
                    <option value="Cancelled">Cancel order</option>
                </select>
            </div>
        `;

        container.appendChild(card);
    });
}

function updateOrderStatus(orderId, status) {
    if (!status) return;

    const orders = getOrders();

    const index = orders.findIndex(order =>
        String(order.id) === String(orderId)
    );

    if (index === -1) return;

    orders[index].status = status;

    if (!Array.isArray(orders[index].statusHistory)) {
        orders[index].statusHistory = [];
    }

    orders[index].statusHistory.push({
        status,
        time: new Date().toISOString()
    });

    saveOrders(orders);

    showToast("Order status updated!");

    renderOrders();
    renderOverview();
}

document.getElementById("orderFilter").addEventListener("change", renderOrders);


/* MENU MANAGEMENT */

function renderMenu() {
    const container = document.getElementById("menuManagerGrid");
    const empty = document.getElementById("menuEmpty");

    container.innerHTML = "";
    empty.style.display = menu.length ? "none" : "block";

    menu.forEach(food => {
        const card = document.createElement("div");
        card.className = "menu-manager-card";

        card.innerHTML = `
            <img src="${escapeHTML(food.image || "")}" alt="${escapeHTML(food.name)}"
                 onerror="this.style.display='none'">

            <div class="menu-manager-info">
                <h3>${escapeHTML(food.name)}</h3>
                <p>${escapeHTML(food.description)}</p>
                <strong>${money(food.price)}</strong>

                <p>${food.available ? "🟢 Available" : "🔴 Unavailable"}</p>

                <div class="menu-manager-actions">
                    <button onclick="editFood('${escapeHTML(food.id)}')">Edit</button>
                    <button onclick="toggleFoodAvailability('${escapeHTML(food.id)}')">
                        ${food.available ? "Disable" : "Enable"}
                    </button>
                    <button onclick="deleteFood('${escapeHTML(food.id)}')">Delete</button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

const foodModal = document.getElementById("foodModal");

document.getElementById("addFoodBtn").addEventListener("click", () => {
    document.getElementById("foodForm").reset();
    document.getElementById("foodId").value = "";
    document.getElementById("foodModalTitle").textContent = "Add New Meal";

    foodModal.classList.add("show");
});

document.getElementById("closeFoodModal").addEventListener("click", () => {
    foodModal.classList.remove("show");
});

function editFood(id) {
    const food = menu.find(item => item.id === id);

    if (!food) return;

    document.getElementById("foodId").value = food.id;
    document.getElementById("foodName").value = food.name;
    document.getElementById("foodDescription").value = food.description;
    document.getElementById("foodPrice").value = food.price;
    document.getElementById("foodImage").value = food.image || "";

    document.getElementById("foodModalTitle").textContent = "Edit Meal";

    foodModal.classList.add("show");
}

document.getElementById("foodForm").addEventListener("submit", event => {
    event.preventDefault();

    const id = document.getElementById("foodId").value;

    const food = {
        id: id || "food" + Date.now(),
        name: document.getElementById("foodName").value.trim(),
        description: document.getElementById("foodDescription").value.trim(),
        price: Number(document.getElementById("foodPrice").value),
        image: document.getElementById("foodImage").value.trim(),
        available: true
    };

    if (id) {
        const index = menu.findIndex(item => item.id === id);

        if (index !== -1) {
            food.available = menu[index].available;
            menu[index] = food;
        }
    } else {
        menu.push(food);
    }

    saveMenu();
    renderMenu();

    foodModal.classList.remove("show");

    showToast("Menu saved successfully!");
});

function toggleFoodAvailability(id) {
    const food = menu.find(item => item.id === id);

    if (!food) return;

    food.available = !food.available;

    saveMenu();
    renderMenu();

    showToast("Meal availability updated.");
}

function deleteFood(id) {
    if (!confirm("Are you sure you want to delete this meal?")) return;

    menu = menu.filter(item => item.id !== id);

    saveMenu();
    renderMenu();

    showToast("Meal deleted.");
}


/* SETTINGS */

function loadSettings() {
    document.getElementById("restaurantName").textContent =
        restaurantSettings.name;

    document.getElementById("settingRestaurantName").value =
        restaurantSettings.name;

    document.getElementById("settingRestaurantCategory").value =
        restaurantSettings.category;

    document.getElementById("settingDeliveryTime").value =
        restaurantSettings.deliveryTime;
}

document.getElementById("saveRestaurantSettings").addEventListener("click", () => {
    restaurantSettings.name =
        document.getElementById("settingRestaurantName").value.trim();

    restaurantSettings.category =
        document.getElementById("settingRestaurantCategory").value;

    restaurantSettings.deliveryTime =
        document.getElementById("settingDeliveryTime").value.trim();

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(restaurantSettings));

    loadSettings();
    renderOverview();

    showToast("Restaurant settings saved.");
});


/* LOGOUT */

document.getElementById("restaurantLogout").addEventListener("click", () => {
    if (confirm("Leave the restaurant dashboard?")) {
        window.location.href = "index.html";
    }
});


/* INITIALIZE */

loadSettings();
renderOverview();
renderMenu();
