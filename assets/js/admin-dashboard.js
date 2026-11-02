/* =====================================
   KWIQEAT ADMIN DASHBOARD
===================================== */

const ADMIN_KEYS = {
    orders: "kwiQeatOrders",
    restaurants: "kwiQeatAdminRestaurants",
    accounts: "kwiQeatAccount",
    categories: "kwiQeatCategories",
    settings: "kwiQeatPlatformSettings"
};

const defaultRestaurants = [
    {
        id: "1",
        name: "Mama's Kitchen",
        category: "Rice",
        delivery: "20–30 mins",
        status: "active"
    },
    {
        id: "2",
        name: "Burger Republic",
        category: "Burgers",
        delivery: "25–35 mins",
        status: "active"
    },
    {
        id: "3",
        name: "Pizza District",
        category: "Pizza",
        delivery: "30–40 mins",
        status: "active"
    },
    {
        id: "4",
        name: "Chicken Republic",
        category: "Chicken",
        delivery: "20–30 mins",
        status: "active"
    },
    {
        id: "5",
        name: "The Smoothie Bar",
        category: "Drinks",
        delivery: "15–25 mins",
        status: "active"
    },
    {
        id: "6",
        name: "Street Bites",
        category: "Snacks",
        delivery: "15–25 mins",
        status: "active"
    }
];

const defaultCategories = [
    "Rice",
    "Burgers",
    "Pizza",
    "Chicken",
    "Drinks",
    "Snacks"
];

let restaurants = loadData(ADMIN_KEYS.restaurants, defaultRestaurants);
let categories = loadData(ADMIN_KEYS.categories, defaultCategories);

let platformSettings = loadData(ADMIN_KEYS.settings, {
    name: "kwiQeat",
    email: "",
    deliveryFee: 500,
    serviceFee: 3
});


/* STORAGE HELPERS */

function loadData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);

        return saved ? JSON.parse(saved) : structuredClone(fallback);
    } catch (error) {
        console.error("Could not load:", key, error);
        return structuredClone(fallback);
    }
}

function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getOrders() {
    const orders = loadData(ADMIN_KEYS.orders, []);
    return Array.isArray(orders) ? orders : [];
}

function getCustomers() {
    const account = loadData(ADMIN_KEYS.accounts, null);

    if (!account) return [];

    // Supports either one account object or an array of accounts.
    return Array.isArray(account) ? account : [account];
}

function money(amount) {
    return "₦" + Number(amount || 0).toLocaleString("en-NG");
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function showToast(message) {
    const toast = document.getElementById("dashboardToast");

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => toast.classList.remove("show"), 2500);
}


/* NAVIGATION */

const adminSections = document.querySelectorAll(".dashboard-section");
const adminLinks = document.querySelectorAll(".dashboard-nav a");

const adminHeadings = {
    overview: "Overview",
    restaurants: "Restaurants",
    orders: "Orders",
    customers: "Customers",
    categories: "Categories",
    settings: "Settings"
};

function showAdminSection(sectionId) {
    adminSections.forEach(section => {
        section.classList.toggle("active", section.id === sectionId);
    });

    adminLinks.forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.section === sectionId
        );
    });

    document.getElementById("adminHeading").textContent =
        adminHeadings[sectionId] || "Dashboard";

    document.getElementById("adminSidebar").classList.remove("open");

    switch (sectionId) {
        case "overview":
            renderOverview();
            break;

        case "restaurants":
            renderRestaurants();
            break;

        case "orders":
            renderAdminOrders();
            break;

        case "customers":
            renderCustomers();
            break;

        case "categories":
            renderCategories();
            break;
    }
}

adminLinks.forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        showAdminSection(link.dataset.section);
    });
});

document.getElementById("adminMenuToggle").addEventListener("click", () => {
    document.getElementById("adminSidebar").classList.toggle("open");
});


/* OVERVIEW */

function renderOverview() {
    const orders = getOrders();
    const customers = getCustomers();

    const completedOrders = orders.filter(order =>
        order.status === "Delivered"
    );

    const totalSales = completedOrders.reduce((sum, order) => {
        return sum + Number(order.total || 0);
    }, 0);

    document.getElementById("adminTotalOrders").textContent =
        orders.length;

    document.getElementById("adminTotalRestaurants").textContent =
        restaurants.length;

    document.getElementById("adminTotalCustomers").textContent =
        customers.length;

    document.getElementById("adminTotalSales").textContent =
        money(totalSales);

    const table = document.getElementById("adminRecentOrders");
    const empty = document.getElementById("adminRecentEmpty");

    const recentOrders = [...orders].reverse().slice(0, 5);

    table.innerHTML = "";

    empty.style.display = recentOrders.length ? "none" : "block";

    recentOrders.forEach(order => {
        const customer = order.customer || {};

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(order.id)}</td>
            <td>${escapeHTML(customer.name || "Customer")}</td>
            <td>${escapeHTML(order.restaurant || order.restaurantName || "Unknown")}</td>
            <td>${money(order.total)}</td>
            <td>
                <span class="admin-status ${getStatusClass(order.status)}">
                    ${escapeHTML(order.status || "Unknown")}
                </span>
            </td>
        `;

        table.appendChild(row);
    });

    document.getElementById("adminActivity").textContent =
        `${orders.length} orders recorded, ${completedOrders.length} completed, and ${orders.length - completedOrders.length} not yet completed.`;
}

function getStatusClass(status) {
    if (status === "Delivered" || status === "active") return "active";

    if (status === "Order placed" || status === "pending") return "pending";

    if (status === "Cancelled" || status === "suspended") return "suspended";

    return "pending";
}


/* RESTAURANT MANAGEMENT */

function saveRestaurants() {
    saveData(ADMIN_KEYS.restaurants, restaurants);
}

function renderRestaurants() {
    const table = document.getElementById("adminRestaurantsTable");
    const empty = document.getElementById("adminRestaurantsEmpty");

    const search = document.getElementById("restaurantSearch")
        .value.toLowerCase();

    const status = document.getElementById("restaurantStatusFilter").value;

    const filtered = restaurants.filter(restaurant => {
        const matchesSearch = restaurant.name.toLowerCase().includes(search);

        const matchesStatus =
            status === "all" || restaurant.status === status;

        return matchesSearch && matchesStatus;
    });

    table.innerHTML = "";

    empty.style.display = filtered.length ? "none" : "block";

    filtered.forEach(restaurant => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(restaurant.name)}</td>
            <td>${escapeHTML(restaurant.category)}</td>
            <td>${escapeHTML(restaurant.delivery)}</td>

            <td>
                <span class="admin-status ${getStatusClass(restaurant.status)}">
                    ${escapeHTML(restaurant.status)}
                </span>
            </td>

            <td>
                <button class="admin-action"
                    onclick="editRestaurant('${escapeHTML(restaurant.id)}')">
                    Edit
                </button>

                ${
                    restaurant.status === "active"
                    ? `<button class="admin-danger"
                        onclick="toggleRestaurantStatus('${escapeHTML(restaurant.id)}')">
                        Suspend
                    </button>`
                    : `<button class="admin-success"
                        onclick="toggleRestaurantStatus('${escapeHTML(restaurant.id)}')">
                        Activate
                    </button>`
                }

                <button class="admin-danger"
                    onclick="deleteRestaurant('${escapeHTML(restaurant.id)}')">
                    Delete
                </button>
            </td>
        `;

        table.appendChild(row);
    });
}

document.getElementById("restaurantSearch").addEventListener(
    "input",
    renderRestaurants
);

document.getElementById("restaurantStatusFilter").addEventListener(
    "change",
    renderRestaurants
);


/* ADD RESTAURANT */

const restaurantModal = document.getElementById("restaurantModal");

document.getElementById("addRestaurantBtn").addEventListener("click", () => {
    document.getElementById("restaurantForm").reset();

    document.getElementById("restaurantId").value = "";

    document.getElementById("restaurantModalTitle").textContent =
        "Add Restaurant";

    restaurantModal.classList.add("show");
});

document.getElementById("closeRestaurantModal").addEventListener("click", () => {
    restaurantModal.classList.remove("show");
});

function editRestaurant(id) {
    const restaurant = restaurants.find(item => item.id === id);

    if (!restaurant) return;

    document.getElementById("restaurantId").value = restaurant.id;

    document.getElementById("newRestaurantName").value =
        restaurant.name;

    document.getElementById("newRestaurantCategory").value =
        restaurant.category;

    document.getElementById("newRestaurantDelivery").value =
        restaurant.delivery;

    document.getElementById("restaurantModalTitle").textContent =
        "Edit Restaurant";

    restaurantModal.classList.add("show");
}

document.getElementById("restaurantForm").addEventListener("submit", event => {
    event.preventDefault();

    const id = document.getElementById("restaurantId").value;

    const name = document.getElementById("newRestaurantName")
        .value.trim();

    const category = document.getElementById("newRestaurantCategory")
        .value;

    const delivery = document.getElementById("newRestaurantDelivery")
        .value.trim();

    if (!name) return;

    if (restaurants.some(item =>
        item.name.toLowerCase() === name.toLowerCase() && item.id !== id
    )) {
        showToast("A restaurant with this name already exists.");
        return;
    }

    if (id) {
        const restaurant = restaurants.find(item => item.id === id);

        if (restaurant) {
            restaurant.name = name;
            restaurant.category = category;
            restaurant.delivery = delivery;
        }
    } else {
        restaurants.push({
            id: "restaurant-" + Date.now(),
            name,
            category,
            delivery,
            status: "pending"
        });
    }

    saveRestaurants();

    restaurantModal.classList.remove("show");

    renderRestaurants();
    renderOverview();

    showToast("Restaurant saved successfully.");
});

function toggleRestaurantStatus(id) {
    const restaurant = restaurants.find(item => item.id === id);

    if (!restaurant) return;

    restaurant.status =
        restaurant.status === "active" ? "suspended" : "active";

    saveRestaurants();

    renderRestaurants();
    renderOverview();

    showToast("Restaurant status updated.");
}

function deleteRestaurant(id) {
    const restaurant = restaurants.find(item => item.id === id);

    if (!restaurant) return;

    if (!confirm(`Delete ${restaurant.name} from the restaurant list?`)) {
        return;
    }

    restaurants = restaurants.filter(item => item.id !== id);

    saveRestaurants();

    renderRestaurants();
    renderOverview();

    showToast("Restaurant deleted.");
}


/* ORDER MANAGEMENT */

function renderAdminOrders() {
    const table = document.getElementById("adminOrdersTable");
    const empty = document.getElementById("adminOrdersEmpty");

    const search = document.getElementById("orderSearch")
        .value.toLowerCase();

    const status = document.getElementById("adminOrderFilter").value;

    const filtered = getOrders().filter(order => {
        const customer = order.customer || {};

        const matchesSearch =
            String(order.id || "").toLowerCase().includes(search) ||
            String(customer.name || "").toLowerCase().includes(search);

        const matchesStatus =
            status === "all" || order.status === status;

        return matchesSearch && matchesStatus;
    }).reverse();

    table.innerHTML = "";

    empty.style.display = filtered.length ? "none" : "block";

    filtered.forEach(order => {
        const customer = order.customer || {};

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(order.id)}</td>
            <td>${escapeHTML(customer.name || "Customer")}</td>
            <td>${escapeHTML(order.restaurant || order.restaurantName || "Unknown")}</td>
            <td>${money(order.total)}</td>
            <td>
                <span class="admin-status ${getStatusClass(order.status)}">
                    ${escapeHTML(order.status || "Unknown")}
                </span>
            </td>
            <td>${escapeHTML(formatDate(order.createdAt))}</td>
        `;

        table.appendChild(row);
    });
}

function formatDate(date) {
    if (!date) return "N/A";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "N/A";

    return parsed.toLocaleDateString("en-NG");
}

document.getElementById("orderSearch").addEventListener(
    "input",
    renderAdminOrders
);

document.getElementById("adminOrderFilter").addEventListener(
    "change",
    renderAdminOrders
);


/* CUSTOMER MANAGEMENT */

function renderCustomers() {
    const table = document.getElementById("adminCustomersTable");
    const empty = document.getElementById("adminCustomersEmpty");

    const search = document.getElementById("customerSearch")
        .value.toLowerCase();

    const customers = getCustomers();

    const filtered = customers.filter(customer => {
        const name = customer.name || customer.fullName || "";
        const email = customer.email || "";

        return (
            name.toLowerCase().includes(search) ||
            email.toLowerCase().includes(search)
        );
    });

    table.innerHTML = "";

    empty.style.display = filtered.length ? "none" : "block";

    filtered.forEach(customer => {
        const name = customer.name || customer.fullName || "Customer";
        const email = customer.email || "N/A";
        const phone = customer.phone || "N/A";

        const orderCount = getOrders().filter(order =>
            (order.customer?.email || "").toLowerCase() ===
            email.toLowerCase()
        ).length;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(name)}</td>
            <td>${escapeHTML(email)}</td>
            <td>${escapeHTML(phone)}</td>
            <td>${orderCount}</td>
        `;

        table.appendChild(row);
    });
}

document.getElementById("customerSearch").addEventListener(
    "input",
    renderCustomers
);


/* CATEGORY MANAGEMENT */

function renderCategories() {
    const container = document.getElementById("categoryAdminList");

    container.innerHTML = "";

    categories.forEach((category, index) => {
        const item = document.createElement("div");

        item.className = "category-admin-item";

        item.innerHTML = `
            <strong>${escapeHTML(category)}</strong>

            <button onclick="deleteCategory(${index})">
                Remove
            </button>
        `;

        container.appendChild(item);
    });
}

document.getElementById("categoryForm").addEventListener("submit", event => {
    event.preventDefault();

    const input = document.getElementById("newCategory");

    const category = input.value.trim();

    if (!category) return;

    if (categories.some(item =>
        item.toLowerCase() === category.toLowerCase()
    )) {
        showToast("This category already exists.");
        return;
    }

    categories.push(category);

    saveData(ADMIN_KEYS.categories, categories);

    input.value = "";

    renderCategories();

    showToast("Category added.");
});

function deleteCategory(index) {
    if (!confirm("Remove this category?")) return;

    categories.splice(index, 1);

    saveData(ADMIN_KEYS.categories, categories);

    renderCategories();

    showToast("Category removed.");
}


/* PLATFORM SETTINGS */

function loadPlatformSettings() {
    document.getElementById("platformName").value =
        platformSettings.name;

    document.getElementById("platformEmail").value =
        platformSettings.email;

    document.getElementById("deliveryFee").value =
        platformSettings.deliveryFee;

    document.getElementById("serviceFee").value =
        platformSettings.serviceFee;
}

document.getElementById("platformSettingsForm").addEventListener(
    "submit",
    event => {
        event.preventDefault();

        platformSettings = {
            name: document.getElementById("platformName").value.trim(),
            email: document.getElementById("platformEmail").value.trim(),
            deliveryFee: Number(document.getElementById("deliveryFee").value),
            serviceFee: Number(document.getElementById("serviceFee").value)
        };

        saveData(ADMIN_KEYS.settings, platformSettings);

        showToast("Platform settings saved.");
    }
);


/* LOGOUT */

document.getElementById("adminLogout").addEventListener("click", () => {
    if (confirm("Leave the admin dashboard?")) {
        window.location.href = "index.html";
    }
});


/* INITIALIZATION */

loadPlatformSettings();

renderOverview();
renderRestaurants();
renderAdminOrders();
renderCustomers();
renderCategories();
