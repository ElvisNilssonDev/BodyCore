const API_BASE_URL = "https://localhost:7116"; 
// byt port om ditt API kör på annan port

const resultsContainer = document.getElementById("results-container");
const loading = document.getElementById("loading");
const errorBanner = document.getElementById("error");
const buttons = document.querySelectorAll(".btn");

async function fetchData(endpoint) {
    loading.style.display = "block";
    errorBanner.style.display = "none";
    resultsContainer.innerHTML = "";

    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();
        renderData(data, endpoint);
    } catch (error) {
        console.error(error);
        errorBanner.textContent = "Kunde inte hämta data från API:t.";
        errorBanner.style.display = "block";
    } finally {
        loading.style.display = "none";
    }
}

function renderData(data, endpoint) {
    if (!Array.isArray(data)) {
        resultsContainer.innerHTML = "<p>Ingen data att visa.</p>";
        return;
    }

    if (data.length === 0) {
        resultsContainer.innerHTML = "<p>Tom lista.</p>";
        return;
    }

    data.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("card");

        if (endpoint === "LiftEntry") {
            card.innerHTML = `
                <h3>${item.title ?? "Ingen titel"}</h3>
                <p>Exercise: ${item.exercise ?? "-"}</p>
                <p>Weight: ${item.weightKg ?? "-"} kg</p>
                <p>Reps: ${item.reps ?? "-"}</p>
                <p>Sets: ${item.sets ?? "-"}</p>
            `;
        } 
        else if (endpoint === "NutritionEntry") {
            card.innerHTML = `
                <h3>${item.title ?? "Ingen titel"}</h3>
                <p>Calories: ${item.calories ?? "-"}</p>
                <p>Protein: ${item.proteinGrams ?? "-"}</p>
                <p>Carbs: ${item.carbsGrams ?? "-"}</p>
                <p>Fat: ${item.fatGrams ?? "-"}</p>
            `;
        } 
        else {
            card.innerHTML = `<pre>${JSON.stringify(item, null, 2)}</pre>`;
        }

        resultsContainer.appendChild(card);
    });
}

buttons.forEach(button => {
    button.addEventListener("click", () => {
        buttons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const endpoint = button.dataset.endpoint;
        fetchData(endpoint);
    });
});

fetchData("LiftEntry");