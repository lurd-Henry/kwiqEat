// ===================================
// KWIQEAT FAVOURITES PAGE
// ===================================

const FAVOURITES_KEY = “kwiqEatFavourites”;
const CART_KEY = “kwiqEatCart”;

const favouriteRestaurants =
document.getElementById(“favouriteRestaurants”);

const favouriteMeals =
document.getElementById(“favouriteMeals”);

// ===================================
// RESTAURANT DATA
// ===================================

const restaurantList = [
{
id: 1,
name: “Mama’s Kitchen”,
category: “Nigerian • Local meals”,
rating: “4.9”,
delivery: “20-35 min”,
price: “₦500 delivery”,
badge: “Popular”,
image: “https://images.unsplash.com/photo-1547592180-85f173990554?w=700”
},
{
id: 2,
name: “Burger Republic”,
category: “Burgers • Fast food”,
rating: “4.8”,
delivery: “15-30 min”,
price: “₦700 delivery”,
badge: “Trending”,
image: “https://images.unsplash.com/photo-1550547660-d9450f859349?w=700”
},
{
id: 3,
name: “Pizza District”,
category: “Pizza • Italian”,
rating: “4.7”,
delivery: “25-40 min”,
price: “₦600 delivery”,
badge: “Top rated”,
image: “https://images.unsplash.com/photo-1579751626657-72bc17010498?w=700”
},
{
id: 4,
name: “Chicken Republic”,
category: “Chicken • Fast food”,
rating: “4.9”,
delivery: “20-35 min”,
price: “₦500 delivery”,
badge: “Customer favourite”,
image: “https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=700”
},
{
id: 5,
name: “The Smoothie Bar”,
category: “Drinks • Healthy”,
rating: “4.6”,
delivery: “15-25 min”,
price: “₦400 delivery”,
badge: “Fresh picks”,
image: “https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=700”
},
{
id: 6,
name: “Street Bites”,
category: “Snacks • Shawarma”,
rating: “4.8”,
delivery: “20-30 min”,
price: “₦500 delivery”,
badge: “Recommended”,
image: “https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=700”
}
];

// ===================================
// STORAGE
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

// ===================================
// RENDER RESTAURANTS
// ===================================

function renderFavouriteRestaurants() {

const favourites = getFavourites();
const saved = restaurantList.filter(restaurant =>
    favourites.restaurants.includes(restaurant.id)
);
if (!saved.length) {
    favouriteRestaurants.innerHTML = `
        <div class="favourite-empty">
            <span>♡</span>
            <h3>No favourite restaurants yet.</h3>
            <p>Explore restaurants and tap the heart to save them.</p>
            <a href="index.html#restaurants">Explore restaurants →</a>
        </div>
    `;
    return;
}
favouriteRestaurants.innerHTML = saved.map(restaurant => `
    <article class="restaurant-card">
        <div class="restaurant-image">
            <img src="${restaurant.image}" alt="${restaurant.name}">
            <button
                class="favourite-btn active"
                onclick="removeRestaurantFavourite(${restaurant.id})"
            >
                ♥
            </button>
        </div>
        <div class="restaurant-info">
            <h3>${restaurant.name}</h3>
            <p>${restaurant.category}</p>
            <div class="restaurant-meta">
                <span class="rating">★ ${restaurant.rating}</span>
                <span>${restaurant.delivery}</span>
                <span>${restaurant.price}</span>
            </div>
            <a class="favourite-open-btn"
                href="restaurant.html?id=${restaurant.id}">
                Explore menu →
            </a>
        </div>
    </article>
`).join("");

}

// ===================================
// RENDER MEALS
// ===================================

function renderFavouriteMeals() {

const favourites = getFavourites();
if (!favourites.meals.length) {
    favouriteMeals.innerHTML = `
        <div class="favourite-empty">
            <span>♡</span>
            <h3>No favourite meals yet.</h3>
            <p>Save meals you love and they'll appear here.</p>
            <a href="index.html#restaurants">Discover meals →</a>
        </div>
    `;
    return;
}
favouriteMeals.innerHTML = favourites.meals.map(meal => `
    <article class="food-card">
        <div class="food-image">
            <img src="${meal.image}" alt="${meal.name}">
            <button
                class="favourite-btn active"
                onclick="removeMealFavourite('${meal.key}')"
            >
                ♥
            </button>
        </div>
        <div class="food-info">
            <h3>${meal.name}</h3>
            <p>${meal.restaurantName}</p>
            <div class="food-bottom">
                <strong>
                    ₦${Number(meal.price).toLocaleString("en-NG")}
                </strong>
                <button
                    onclick="addFavouriteMealToCart('${meal.key}')"
                >
                    + Add
                </button>
            </div>
        </div>
    </article>
`).join("");

}

// ===================================
// REMOVE FAVOURITES
// ===================================

function removeRestaurantFavourite(id) {

const favourites = getFavourites();
favourites.restaurants =
    favourites.restaurants.filter(item => item !== id);
saveFavourites(favourites);
renderFavouriteRestaurants();
showToast("Restaurant removed from favourites.");

}

function removeMealFavourite(key) {

const favourites = getFavourites();
favourites.meals =
    favourites.meals.filter(item => item.key !== key);
saveFavourites(favourites);
renderFavouriteMeals();
showToast("Meal removed from favourites.");

}

// ===================================
// ADD FAVOURITE MEAL TO CART
// ===================================

function addFavouriteMealToCart(key) {

const favourites = getFavourites();
const meal = favourites.meals.find(item => item.key === key);
if (!meal) return;
let cart = [];
try {
    cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
} catch {
    cart = [];
}
if (
    cart.length &&
    Number(cart[0].restaurantId) !== Number(meal.restaurantId)
) {
    showToast("Your cart contains items from another restaurant. Clear it first.");
    return;
}
const existing = cart.find(item =>
    Number(item.id) === Number(meal.id)
);
if (existing) {
    existing.quantity++;
} else {
    cart.push({
        id: meal.id,
        name: meal.name,
        category: meal.category,
        price: meal.price,
        image: meal.image,
        description: meal.description,
        quantity: 1,
        restaurantId: String(meal.restaurantId),
        restaurantName: meal.restaurantName
    });
}
localStorage.setItem(CART_KEY, JSON.stringify(cart));
showToast("Meal added to cart! 🛒");

}

// ===================================
// TOAST
// ===================================

let toastTimeout;

function showToast(message) {

const toast = document.getElementById("toast");
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

document.getElementById(“year”).textContent =
new Date().getFullYear();

renderFavouriteRestaurants();

renderFavouriteMeals();
