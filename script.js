const buttons = document.querySelectorAll(".btn");
const loadingDiv = document.getElementById("loading");
const errorDiv = document.getElementById("error");
const resultsContainer = document.getElementById("results-container");

// Base URL for the API
const API_BASE = "https://localhost:7239/api";

let currentData = [];

// Function to fetch data from the API and display it using cards
async function fetchData(endpoint) {
    if (!loadingDiv || !errorDiv || !resultsContainer) return;

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
    if (!resultsContainer) return;

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

// Only attach fetch button logic if buttons exist
if (buttons.length > 0) {
    buttons.forEach(button => {
        button.addEventListener("click", function () {
            const endpoint = button.getAttribute("data-endpoint");

            // only fetch if the button is meant for viewing data
            if (endpoint && resultsContainer) {
                buttons.forEach(btn => btn.classList.remove("active"));
                button.classList.add("active");
                fetchData(endpoint);
            }
        });
    });
}

// Only auto-fetch on the page that actually has results container
if (resultsContainer) {
    fetchData("liftentries");
}

// Navigation buttons
const goToLift = document.getElementById("goToLift");
const goToNutrition = document.getElementById("goToNutrition");

if (goToLift) {
    goToLift.addEventListener("click", () => {
        window.location.href = "AddLift.html";
    });
}

if (goToNutrition) {
    goToNutrition.addEventListener("click", () => {
        window.location.href = "AddNutrition.html";
    });
}

// Add lift form
const liftForm = document.getElementById("liftForm");
const messageBox = document.getElementById("message");
const backBtn = document.getElementById("backBtn");

if (backBtn) {
    backBtn.addEventListener("click", () => {
        window.location.href = "index.html";
    });
}

if (liftForm) {
    liftForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("title").value.trim();
        const time = document.getElementById("time").value;
        const exercise = document.getElementById("exercise").value.trim();
        const weightKg = parseFloat(document.getElementById("weightKg").value);
        const reps = parseInt(document.getElementById("reps").value);
        const sets = parseInt(document.getElementById("sets").value);
        const trainingDayId = parseInt(document.getElementById("trainingDayId").value);

        const newLift = {
            title: title,
            time: new Date(time).toISOString(),
            exercise: exercise,
            weightKg: weightKg,
            reps: reps,
            sets: sets,
            trainingDayId: trainingDayId
        };

        console.log("Sending lift:", newLift);

        try {
            const response = await fetch(`${API_BASE}/liftentries`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newLift)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to add lift. Status: ${response.status}. ${errorText}`);
            }

            let createdLift = null;
            const responseText = await response.text();

            if (responseText) {
                createdLift = JSON.parse(responseText);
            }

            if (messageBox) {
                messageBox.style.display = "block";
                messageBox.innerHTML = `
                    <p><strong>Lift added successfully.</strong></p>
                    <pre>${JSON.stringify(createdLift ?? newLift, null, 2)}</pre>
                `;
            }

            liftForm.reset();

        } catch (error) {
            console.error("POST failed:", error);

            if (messageBox) {
                messageBox.style.display = "block";
                messageBox.innerHTML = `<p class="error">Error: ${error.message}</p>`;
            }
        }
    });
}

const nutritionForm = document.getElementById("nutritionForm");

if (nutritionForm) {
    nutritionForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("nutritionTitle").value.trim();
        const time = document.getElementById("nutritionTime").value;
        const calories = parseInt(document.getElementById("calories").value);
        const proteinGrams = parseInt(document.getElementById("protein").value);
        const carbsGrams = parseInt(document.getElementById("carbs").value);
        const fatGrams = parseInt(document.getElementById("fat").value);
        const trainingDayId = parseInt(document.getElementById("nutritionTrainingDayId").value);

        const newNutrition = {
            title: title,
            time: new Date(time).toISOString(),
            calories: calories,
            proteinGrams: proteinGrams,
            carbsGrams: carbsGrams,
            fatGrams: fatGrams,
            trainingDayId: trainingDayId
        };

        console.log("Sending nutrition:", newNutrition);

        try {
            const response = await fetch(`${API_BASE}/nutritionentries`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newNutrition)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to add nutrition. Status: ${response.status}. ${errorText}`);
            }

            let createdNutrition = null;
            const responseText = await response.text();

            if (responseText) {
                createdNutrition = JSON.parse(responseText);
            }

            if (messageBox) {
                messageBox.style.display = "block";
                messageBox.innerHTML = `
                    <p><strong>Meal added successfully.</strong></p>
                    <pre>${JSON.stringify(createdNutrition ?? newNutrition, null, 2)}</pre>
                `;
            }

            nutritionForm.reset();

        } catch (error) {
            console.error("Nutrition POST failed:", error);

            if (messageBox) {
                messageBox.style.display = "block";
                messageBox.innerHTML = `<p class="error">Error: ${error.message}</p>`;
            }
        }
    });
}