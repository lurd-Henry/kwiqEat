const ORDERS_KEY = "kwiQeatOrders";

const steps = [
    "Order placed",
    "Order confirmed",
    "Preparing your food",
    "Out for delivery",
    "Delivered"
];

const trackingForm = document.getElementById("trackingForm");
const trackingResult = document.getElementById("trackingResult");

document.getElementById("year").textContent =
    new Date().getFullYear();


function getOrders() {
    try {
        return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    } catch {
        return [];
    }
}


function renderTracking(order) {

    const currentIndex = steps.indexOf(order.status);

    trackingResult.innerHTML = "";

    const card = document.createElement("div");
    card.className = "tracking-card";

    const title = document.createElement("h2");
    title.textContent = "Order " + order.id;

    const restaurant = document.createElement("p");
    restaurant.textContent = "Restaurant: " + order.restaurant;

    const status = document.createElement("p");
    status.className = "tracking-current-status";
    status.textContent = "Current status: " + order.status;

    const timeline = document.createElement("div");
    timeline.className = "tracking-timeline";

    steps.forEach((step, index) => {

        const item = document.createElement("div");

        item.className = "tracking-step";

        if (index <= currentIndex) {
            item.classList.add("completed");
        }

        const marker = document.createElement("span");
        marker.className = "tracking-marker";
        marker.textContent = index <= currentIndex ? "✓" : index + 1;

        const text = document.createElement("span");
        text.textContent = step;

        item.append(marker, text);
        timeline.appendChild(item);

    });

    const note = document.createElement("p");
    note.className = "tracking-note";
    note.textContent =
        "Order status updates will appear here as the restaurant and delivery team process your order.";

    card.append(title, restaurant, status, timeline, note);

    trackingResult.appendChild(card);
}


trackingForm.addEventListener("submit", event => {

    event.preventDefault();

    const id = document.getElementById("orderIdInput")
        .value.trim().toUpperCase();

    const order = getOrders().find(
        item => item.id.toUpperCase() === id
    );

    trackingResult.innerHTML = "";

    if (!order) {
        const error = document.createElement("p");
        error.className = "tracking-error";
        error.textContent =
            "We couldn't find that order. Check the order ID and try again.";

        trackingResult.appendChild(error);
        return;
    }

    renderTracking(order);

});


// Automatically show the latest order if available.

try {
    const latest = JSON.parse(
        localStorage.getItem("kwiQeatLatestOrder")
    );

    if (latest) {
        document.getElementById("orderIdInput").value = latest.id;

        renderTracking(latest);
    }
} catch {
    // No latest order available.
}
