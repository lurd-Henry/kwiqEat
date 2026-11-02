// ===================================
// KWIQEAT - CUSTOMER HOMEPAGE
// ===================================


// SAMPLE RESTAURANT DATA

const restaurants = [
    {
        id: 1,
        name: "Mama's Kitchen",
        category: "Nigerian • Local meals",
        rating: "4.9",
        delivery: "20-35 min",
        price: "₦500 delivery",
        badge: "Popular",
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=700",
        keywords: ["rice", "chicken", "nigerian", "local"]
    },

    {
        id: 2,
        name: "Burger Republic",
        category: "Burgers • Fast food",
        rating: "4.8",
        delivery: "15-30 min",
        price: "₦700 delivery",
        badge: "Trending",
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=700",
        keywords: ["burger", "fast food", "snacks"]
    },

    {
        id: 3,
        name: "Pizza District",
        category: "Pizza • Italian",
        rating: "4.7",
        delivery: "25-40 min",
        price: "₦600 delivery",
        badge: "Top rated",
        image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=700",
        keywords: ["pizza", "italian"]
    },

    {
        id: 4,
        name: "Chicken Republic",
        category: "Chicken • Fast food",
        rating: "4.9",
        delivery: "20-35 min",
        price: "₦500 delivery",
        badge: "Customer favourite",
        image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=700",
        keywords: ["chicken", "rice", "fast food"]
    },

    {
        id: 5,
        name: "The Smoothie Bar",
        category: "Drinks • Healthy",
        rating: "4.6",
        delivery: "15-25 min",
        price: "₦400 delivery",
        badge: "Fresh picks",
        image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=700",
        keywords: ["drinks", "smoothie", "healthy"]
    },

    {
        id: 6,
        name: "Street Bites",
        category: "Snacks • Shawarma",
        rating: "4.8",
        delivery: "20-30 min",
        price: "₦500 delivery",
        badge: "Recommended",
        image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=700",
        keywords: ["snacks", "shawarma", "fast food"]
    }
];


// RENDER RESTAURANTS

const restaurantGrid = document.getElementById("restaurantGrid");

function renderRestaurants(data) {

    if (!restaurantGrid) return;

    if (!data.length) {
        restaurantGrid.innerHTML = `
            <div class="restaurant-empty">
                <h3>No restaurants found 😕</h3>
                <p>Try another search.</p>
            </div>
        `;
        return;
    }

    restaurantGrid.innerHTML = data.map(restaurant => `

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

            </div>

            <div class="restaurant-info">

                <h3>${restaurant.name}</h3>

                <p>${restaurant.category}</p>

                <div class="restaurant-meta">

                    <span class="rating">
                        ★ ${restaurant.rating}
                    </span>

                    <span>${restaurant.delivery}</span>

                    <span>${restaurant.price}</span>

                </div>

            </div>

        </article>

    `).join("");
}


function openRestaurant(id) {
    window.location.href = `restaurant.html?id=${id}`;
}

renderRestaurants(restaurants);


// SEARCH FUNCTIONALITY

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");

function searchRestaurants(query) {

    const search = query.toLowerCase().trim();

    const filtered = restaurants.filter(restaurant => {

        return (
            restaurant.name.toLowerCase().includes(search) ||
            restaurant.category.toLowerCase().includes(search) ||
            restaurant.keywords.some(keyword =>
                keyword.includes(search) || search.includes(keyword)
            )
        );

    });

    renderRestaurants(filtered);

    document.getElementById("restaurants")
        .scrollIntoView({ behavior: "smooth" });
}

searchForm.addEventListener("submit", function(event) {

    event.preventDefault();

    if (!searchInput.value.trim()) {
        showToast("Enter a food or restaurant name.");
        return;
    }

    searchRestaurants(searchInput.value);

});


// CATEGORY FILTERING

document.querySelectorAll(".category-card").forEach(card => {

    card.addEventListener("click", function() {

        const category = this.dataset.category;

        searchRestaurants(category);

    });

});


// MOBILE NAVIGATION

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {

    navLinks.classList.toggle("show");

});

document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", () => {

        navLinks.classList.remove("show");

    });

});


// NEWSLETTER DEMO

const newsletterForm = document.getElementById("newsletterForm");

newsletterForm.addEventListener("submit", function(event) {

    event.preventDefault();

    showToast("Thanks for subscribing! 🎉");

    newsletterForm.reset();

});


// TOAST NOTIFICATIONS

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


// FOOTER YEAR

document.getElementById("year").textContent =
    new Date().getFullYear();
