// ===================================
// KWIQEAT - CUSTOMER HOMEPAGE
// STAGE 1.6
// ===================================

const FAVOURITES_KEY = "kwiqEatFavourites";

// ===================================
// RESTAURANT DATA
// ===================================

const restaurants = [
{
id: 1,
name: "Mama’s Kitchen",
category: "Nigerian • Local meals",
rating: 4.9,
delivery: "20-35 min",
deliveryMin: 20,
price: "₦500 delivery",
badge: "Popular",
image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=700",
keywords: ["rice", "chicken", "nigerian", "local", "egusi", "ofada", "jollof"],
menu: ["Jollof Rice & Chicken", "Fried Rice & Turkey", "Egusi Soup & Pounded Yam", "Ofada Rice & Ayamase"]
},

{
    id: 2,
    name: "Burger Republic",
    category: "Burgers • Fast food",
    rating: 4.8,
    delivery: "15-30 min",
    deliveryMin: 15,
    price: "₦700 delivery",
    badge: "Trending",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=700",
    keywords: ["burger", "fast food", "snacks", "beef", "cheese"],
    menu: ["Classic Beef Burger", "Double Cheese Burger", "Chicken Burger"]
},
{
    id: 3,
    name: "Pizza District",
    category: "Pizza • Italian",
    rating: 4.7,
    delivery: "25-40 min",
    deliveryMin: 25,
    price: "₦600 delivery",
    badge: "Top rated",
    image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=700",
    keywords: ["pizza", "italian", "pepperoni", "cheese"],
    menu: ["Classic Pepperoni Pizza", "Chicken Supreme Pizza"]
},
{
    id: 4,
    name: "Chicken Republic",
    category: "Chicken • Fast food",
    rating: 4.9,
    delivery: "20-35 min",
    deliveryMin: 20,
    price: "₦500 delivery",
    badge: "Customer favourite",
    image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=700",
    keywords: ["chicken", "rice", "fast food", "chips", "fries"],
    menu: ["Crispy Fried Chicken", "Chicken & Chips"]
},
{
    id: 5,
    name: "The Smoothie Bar",
    category: "Drinks • Healthy",
    rating: 4.6,
    delivery: "15-25 min",
    deliveryMin: 15,
    price: "₦400 delivery",
    badge: "Fresh picks",
    image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=700",
    keywords: ["drinks", "smoothie", "healthy", "strawberry", "mango"],
    menu: ["Strawberry Smoothie", "Mango Smoothie"]
},
{
    id: 6,
    name: "Street Bites",
    category: "Snacks • Shawarma",
    rating: 4.8,
    delivery: "20-30 min",
    deliveryMin: 20,
    price: "₦500 delivery",
    badge: "Recommended",
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=700",
    keywords: ["snacks", "shawarma", "fast food", "chicken"],
    menu: ["Chicken Shawarma", "Loaded Shawarma"]
}

];

// ===================================
// FAVOURITES STORAGE
// ===================================

function getFavourites() {

try {
    const data = JSON.parse(
        localStorage.getItem(FAVOURITES_KEY)
    );
    return {
        restaurants: Array.isArray(data?.restaurants)
            ? data.restaurants
            : [],
        meals: Array.isArray(data?.meals)
            ? data.meals
            : []
    };
} catch {
    return {
        restaurants: [],
        meals: []
    };
}

}

function saveFavourites(data) {

localStorage.setItem(
    FAVOURITES_KEY,
    JSON.stringify(data)
);

}

function isRestaurantFavourite(id) {

return getFavourites().restaurants.includes(Number(id));

}

function toggleRestaurantFavourite(id) {

const favourites = getFavourites();
id = Number(id);
if (favourites.restaurants.includes(id)) {
    favourites.restaurants =
        favourites.restaurants.filter(item => item !== id);
    showToast("Restaurant removed from favourites.");
} else {
    favourites.restaurants.push(id);
    showToast("Restaurant added to favourites! ❤️");
}
saveFavourites(favourites);
renderRestaurants(currentRestaurants);

}

// ===================================
// RESTAURANT RENDERING
// ===================================

const restaurantGrid = document.getElementById("restaurantGrid");

let currentRestaurants = [...restaurants];

function renderRestaurants(data) {

if (!restaurantGrid) return;
currentRestaurants = [...data];
const count = document.getElementById("restaurantResultCount");
if (count) {
    count.textContent =
        `${data.length} restaurant${data.length === 1 ? "" : "s"}`;
}
if (!data.length) {
    restaurantGrid.innerHTML = `
        <div class="restaurant-empty">
            <h3>Nothing delicious found 😕</h3>
            <p>Try another food or restaurant name.</p>
            <button class="reset-search-btn" onclick="resetSearch()">
                Show all restaurants
            </button>
        </div>
    `;
    return;
}
restaurantGrid.innerHTML = data.map(restaurant => {
    const favourite = isRestaurantFavourite(restaurant.id);
    return `
    <article class="restaurant-card"
        onclick="openRestaurant(${restaurant.id})">
        <div class="restaurant-image">
            <img
                src="${restaurant.image}"
                alt="${restaurant.name}"
                loading="lazy"
            >
            <span class="restaurant-badge">
                ${restaurant.badge}
            </span>
            <button
                class="favourite-btn ${favourite ? "active" : ""}"
                onclick="event.stopPropagation(); toggleRestaurantFavourite(${restaurant.id})"
                aria-label="Toggle ${restaurant.name} favourite"
                title="Add to favourites"
            >
                ${favourite ? "♥" : "♡"}
            </button>
        </div>
        <div class="restaurant-info">
            <h3>${restaurant.name}</h3>
            <p>${restaurant.category}</p>
            <div class="restaurant-meta">
                <span class="rating">
                    ★ ${restaurant.rating.toFixed(1)}
                </span>
                <span>${restaurant.delivery}</span>
                <span>${restaurant.price}</span>
            </div>
        </div>
    </article>
    `;
}).join("");

}

function openRestaurant(id) {

window.location.href = `restaurant.html?id=${id}`;

}

// ===================================
// SEARCH
// ===================================

const searchForm = document.getElementById(“searchForm”);
const searchInput = document.getElementById(“searchInput”);

function searchRestaurants(query, shouldScroll = true) {

const search = query.toLowerCase().trim();
if (!search) {
    resetSearch();
    return;
}
const filtered = restaurants.filter(restaurant => {
    return (
        restaurant.name.toLowerCase().includes(search) ||
        restaurant.category.toLowerCase().includes(search) ||
        restaurant.keywords.some(keyword =>
            keyword.toLowerCase().includes(search)
        ) ||
        restaurant.menu.some(meal =>
            meal.toLowerCase().includes(search)
        )
    );
});
renderRestaurants(filtered);
if (shouldScroll) {
    document.getElementById("restaurants")
        .scrollIntoView({ behavior: "smooth" });
}

}

// LIVE SEARCH

searchInput?.addEventListener(“input”, () => {

searchRestaurants(searchInput.value, false);

});

searchForm?.addEventListener(“submit”, event => {

event.preventDefault();
if (!searchInput.value.trim()) {
    showToast("Enter a food or restaurant name.");
    return;
}
searchRestaurants(searchInput.value);

});

// ===================================
// CATEGORY FILTERING
// ===================================

const categoryMap = {

"Rice": ["rice", "nigerian", "local"],
"Burgers": ["burger", "burgers"],
"Pizza": ["pizza"],
"Chicken": ["chicken"],
"Drinks": ["drinks", "smoothie"],
"Snacks": ["snacks", "shawarma"]

};

document.querySelectorAll(”.category-card”).forEach(card => {

card.addEventListener("click", function() {
    const category = this.dataset.category;
    const keywords = categoryMap[category] || [category.toLowerCase()];
    const filtered = restaurants.filter(restaurant => {
        return keywords.some(keyword =>
            restaurant.keywords.includes(keyword) ||
            restaurant.category.toLowerCase().includes(keyword)
        );
    });
    if (searchInput) searchInput.value = "";
    renderRestaurants(filtered);
    document.getElementById("restaurants")
        .scrollIntoView({ behavior: "smooth" });
});

});

// ===================================
// SORTING
// ===================================

const restaurantSort = document.getElementById(“restaurantSort”);

restaurantSort?.addEventListener(“change”, function() {

const sorted = [...currentRestaurants];
if (this.value === "rating") {
    sorted.sort((a, b) => b.rating - a.rating);
} else if (this.value === "delivery") {
    sorted.sort((a, b) => a.deliveryMin - b.deliveryMin);
} else {
    sorted.sort((a, b) => a.id - b.id);
}
renderRestaurants(sorted);

});

// ===================================
// RESET SEARCH
// ===================================

function resetSearch() {

if (searchInput) searchInput.value = "";
if (restaurantSort) restaurantSort.value = "default";
renderRestaurants(restaurants);

}

// ===================================
// MOBILE NAVIGATION
// ===================================

const menuToggle = document.getElementById(“menuToggle”);
const navLinks = document.getElementById(“navLinks”);

menuToggle?.addEventListener(“click”, () => {

navLinks?.classList.toggle("show");

});

document.querySelectorAll(”.nav-links a”).forEach(link => {

link.addEventListener("click", () => {
    navLinks?.classList.remove("show");
});

});

// ===================================
// NEWSLETTER DEMO
// ===================================

const newsletterForm = document.getElementById(“newsletterForm”);

newsletterForm?.addEventListener(“submit”, function(event) {

event.preventDefault();
showToast("Thanks for subscribing! 🎉");
newsletterForm.reset();

});

// ===================================
// TOAST NOTIFICATIONS
// ===================================

let toastTimeout;

function showToast(message) {

const toast = document.getElementById("toast");
if (!toast) return;
toast.textContent = message;
toast.classList.add("show");
clearTimeout(toastTimeout);
toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
}, 3000);

}

// ===================================
// INITIALIZE
// ===================================

const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

renderRestaurants(restaurants);
