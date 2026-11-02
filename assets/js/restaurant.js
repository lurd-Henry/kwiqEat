// ===================================
// KWIQEAT RESTAURANT SYSTEM
// ===================================

const restaurantData = {

    1: {
        name: "Mama's Kitchen",
        category: "Nigerian • Local meals",
        rating: "4.9",
        delivery: "20-35 min",
        price: "₦500 delivery",
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=900",

        description: "Authentic Nigerian delicacies prepared fresh with love.",

        menu: [

            {
                id: 101,
                name: "Jollof Rice & Chicken",
                category: "Rice",
                price: 4500,
                image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=600",
                description: "Smoky Nigerian jollof rice served with grilled chicken."
            },

            {
                id: 102,
                name: "Fried Rice & Turkey",
                category: "Rice",
                price: 5500,
                image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600",
                description: "Special fried rice served with delicious turkey."
            },

            {
                id: 103,
                name: "Egusi Soup & Pounded Yam",
                category: "Local",
                price: 6000,
                image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600",
                description: "Traditional egusi soup with assorted meat and pounded yam."
            },

            {
                id: 104,
                name: "Ofada Rice & Ayamase",
                category: "Rice",
                price: 5000,
                image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600",
                description: "Ofada rice served with authentic designer stew."
            }

        ]
    },

    2: {
        name: "Burger Republic",
        category: "Burgers • Fast food",
        rating: "4.8",
        delivery: "15-30 min",
        price: "₦700 delivery",
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=900",

        description: "Juicy burgers and delicious fast food made fresh.",

        menu: [

            {
                id: 201,
                name: "Classic Beef Burger",
                category: "Burgers",
                price: 5000,
                image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
                description: "Juicy beef patty with fresh vegetables and sauce."
            },

            {
                id: 202,
                name: "Double Cheese Burger",
                category: "Burgers",
                price: 7500,
                image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600",
                description: "Double beef patty with melted cheese."
            },

            {
                id: 203,
                name: "Chicken Burger",
                category: "Burgers",
                price: 5500,
                image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600",
                description: "Crispy chicken burger with signature dressing."
            }

        ]
    },

    3: {
        name: "Pizza District",
        category: "Pizza • Italian",
        rating: "4.7",
        delivery: "25-40 min",
        price: "₦600 delivery",
        image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=900",

        description: "Freshly baked pizzas with delicious toppings.",

        menu: [

            {
                id: 301,
                name: "Classic Pepperoni Pizza",
                category: "Pizza",
                price: 8500,
                image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600",
                description: "Classic pizza topped with pepperoni and mozzarella."
            },

            {
                id: 302,
                name: "Chicken Supreme Pizza",
                category: "Pizza",
                price: 9500,
                image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600",
                description: "Chicken, cheese, vegetables and special sauce."
            }

        ]
    },

    4: {
        name: "Chicken Republic",
        category: "Chicken • Fast food",
        rating: "4.9",
        delivery: "20-35 min",
        price: "₦500 delivery",
        image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=900",

        description: "Crispy chicken and satisfying meals for every craving.",

        menu: [

            {
                id: 401,
                name: "Crispy Fried Chicken",
                category: "Chicken",
                price: 4000,
                image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600",
                description: "Golden crispy chicken prepared fresh."
            },

            {
                id: 402,
                name: "Chicken & Chips",
                category: "Chicken",
                price: 5500,
                image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=600",
                description: "Crispy chicken served with golden fries."
            }

        ]
    },

    5: {
        name: "The Smoothie Bar",
        category: "Drinks • Healthy",
        rating: "4.6",
        delivery: "15-25 min",
        price: "₦400 delivery",
        image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=900",

        description: "Refreshing smoothies and natural fruit drinks.",

        menu: [

            {
                id: 501,
                name: "Strawberry Smoothie",
                category: "Drinks",
                price: 2500,
                image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600",
                description: "Fresh strawberry blended into a creamy smoothie."
            },

            {
                id: 502,
                name: "Mango Smoothie",
                category: "Drinks",
                price: 2500,
                image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=600",
                description: "Fresh mango smoothie served chilled."
            }

        ]
    },

    6: {
        name: "Street Bites",
        category: "Snacks • Shawarma",
        rating: "4.8",
        delivery: "20-30 min",
        price: "₦500 delivery",
        image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=900",

        description: "Street food favourites made fresh and delicious.",

        menu: [

            {
                id: 601,
                name: "Chicken Shawarma",
                category: "Snacks",
                price: 3500,
                image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600",
                description: "Chicken shawarma with vegetables and creamy sauce."
            },

            {
                id: 602,
                name: "Loaded Shawarma",
                category: "Snacks",
                price: 5000,
                image: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=600",
                description: "Extra filling shawarma with signature toppings."
            }

        ]
    }

};


// GET RESTAURANT ID

const params = new URLSearchParams(window.location.search);

const restaurantId = params.get("id");

const restaurant = restaurantData[restaurantId];

const profile = document.getElementById("restaurantProfile");

const foodGrid = document.getElementById("foodGrid");

const menuCategories = document.getElementById("menuCategories");


// HANDLE INVALID RESTAURANT

if (!restaurant) {

    profile.innerHTML = `
        <h2>Restaurant not found 😕</h2>
        <a href="index.html">Return home</a>
    `;

} else {

    document.title = `${restaurant.name} | kwiqEat`;

    renderProfile();

    renderCategories();

    renderMenu(restaurant.menu);

}


// RESTAURANT PROFILE

function renderProfile() {

    profile.innerHTML = `

        <div class="profile-image">

            <img src="${restaurant.image}" alt="${restaurant.name}">

        </div>

        <div class="profile-info">

            <span class="eyebrow">RESTAURANT</span>

            <h1>${restaurant.name}</h1>

            <p>${restaurant.description}</p>

            <div class="profile-meta">

                <span>⭐ ${restaurant.rating}</span>

                <span>🛵 ${restaurant.delivery}</span>

                <span>${restaurant.price}</span>

            </div>

        </div>

    `;

}


// MENU CATEGORIES

function renderCategories() {

    const categories = [
        "All",
        ...new Set(restaurant.menu.map(item => item.category))
    ];

    menuCategories.innerHTML = categories.map((category, index) => `

        <button
            class="menu-filter ${index === 0 ? "selected" : ""}"
            onclick="filterMenu('${category}', this)"
        >
            ${category}
        </button>

    `).join("");

}


// FILTER MENU

function filterMenu(category, button) {

    document.querySelectorAll(".menu-filter").forEach(btn => {
        btn.classList.remove("selected");
    });

    button.classList.add("selected");

    const filtered = category === "All"
        ? restaurant.menu
        : restaurant.menu.filter(item => item.category === category);

    renderMenu(filtered);

}


// RENDER FOOD

function renderMenu(items) {

    foodGrid.innerHTML = items.map(item => `

        <article class="food-card">

            <div class="food-image">

                <img src="${item.image}" alt="${item.name}" loading="lazy">

            </div>

            <div class="food-info">

                <h3>${item.name}</h3>

                <p>${item.description}</p>

                <div class="food-bottom">

                    <strong>₦${item.price.toLocaleString("en-NG")}</strong>

                    <button onclick="addToCart(${item.id})">
                        + Add
                    </button>

                </div>

            </div>

        </article>

    `).join("");

}


// CART SYSTEM

function getCart() {

    return JSON.parse(localStorage.getItem("kwiqEatCart")) || [];

}


function saveCart(cart) {

    localStorage.setItem("kwiqEatCart", JSON.stringify(cart));

    updateCartCount();

}


function addToCart(foodId) {

    const food = restaurant.menu.find(item => item.id === foodId);

    if (!food) return;

    const cart = getCart();

    // Prevent combining items from different restaurants
    if (cart.length && cart[0].restaurantId !== restaurantId) {

        showToast("Your cart contains items from another restaurant. Clear it before ordering here.");

        return;

    }

    const existing = cart.find(item => item.id === foodId);

    if (existing) {

        existing.quantity++;

    } else {

        cart.push({

            ...food,

            quantity: 1,

            restaurantId,

            restaurantName: restaurant.name

        });

    }

    saveCart(cart);

    showToast(`${food.name} added to cart! 🛒`);

}


// UPDATE CART COUNT

function updateCartCount() {

    const cart = getCart();

    const count = cart.reduce((total, item) => total + item.quantity, 0);

    const cartCount = document.getElementById("cartCount");

    if (cartCount) cartCount.textContent = count;

}


// TOAST

let toastTimeout;

function showToast(message) {

    let toast = document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


// FOOTER

document.getElementById("year").textContent = new Date().getFullYear();

updateCartCount();
