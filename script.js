const buttons = document.querySelectorAll(".btn");
const loadingDiv = document.getElementById("loading");
const errorDiv = document.getElementById("error");
const resultsContainer = document.getElementById("results-container");

const API_BASE = "https://localhost:7239/api";

let currentData = [];

async function fetchData(endpoint) {
    loadingDiv.style.display = "block";
    errorDiv.style.display = "none";
    resultsContainer.innerHTML = "";

    try {
        const url = `${API_BASE}/${endpoint}`;
        console.log("Fetching:", url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("HTTP error! Status: " + response.status);
        }

        const data = await response.json();
        console.log("Received data:", data);

        currentData = data;
        renderData(endpoint, data);

    } catch (error) {
        console.error("Fetch failed:", error);
        errorDiv.textContent = "⚠️ Failed to load data: " + error.message;
        errorDiv.style.display = "block";
    } finally {
        loadingDiv.style.display = "none";
    }
}

function renderData(endpoint, data) {
    resultsContainer.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
        resultsContainer.innerHTML = '<p class="empty-state">No results found.</p>';
        return;
    }

    if (endpoint === "liftentries") {
        data.forEach(lift => {
            resultsContainer.appendChild(createLiftCard(lift));
        });
    } else if (endpoint === "nutritionentries") {
        data.forEach(nutrition => {
            resultsContainer.appendChild(createNutritionCard(nutrition));
        });
    }
}

function createLiftCard(lift) {
    const card = document.createElement("div");
    card.classList.add("card");

    const formattedTime = new Date(lift.time).toLocaleString();

    card.innerHTML = `
        <h3 class="card-title">🏋️ ${lift.title}</h3>
        <p class="card-meta">${lift.exercise}</p>
        <p class="card-body">
            💪 ${lift.weightKg} kg<br>
            🔁 ${lift.reps} reps<br>
            📊 ${lift.sets} sets<br>
            ⏲️ ${formattedTime}
        </p>
    `;

    return card;
}

function createNutritionCard(nutrition) {
    const card = document.createElement("div");
    card.classList.add("card");

    const formattedTime = new Date(nutrition.time).toLocaleString();

    card.innerHTML = `
        <h3 class="card-title">🍽️ ${nutrition.title}</h3>
        <p class="card-meta">${formattedTime}</p>
        <p class="card-body">
            🔥 ${nutrition.calories} kcal<br>
            💪 Protein: ${nutrition.proteinGrams ?? 0}g<br>
            🍞 Carbs: ${nutrition.carbsGrams ?? 0}g<br>
            🧈 Fat: ${nutrition.fatGrams ?? 0}g
        </p>
    `;

    return card;
}

buttons.forEach(button => {
    button.addEventListener("click", function () {
        buttons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const endpoint = button.getAttribute("data-endpoint");
        fetchData(endpoint);
    });
});

fetchData("liftentries");