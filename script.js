// =========================
// Element references
// =========================
const buttons = document.querySelectorAll(".btn");
const loadingDiv = document.getElementById("loading");
const errorDiv = document.getElementById("error");
const resultsContainer = document.getElementById("results-container");

const goToLift = document.getElementById("goToLift");
const goToNutrition = document.getElementById("goToNutrition");

const liftForm = document.getElementById("liftForm");
const nutritionForm = document.getElementById("nutritionForm");
const messageBox = document.getElementById("message");
const backBtn = document.getElementById("backBtn");

const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");
const modalCancel = document.getElementById("modalCancel");
const modalSave = document.getElementById("modalSave");

// AddLift page relations
const trainingWeekSelect = document.getElementById("trainingWeekSelect");
const trainingDaySelect = document.getElementById("trainingDaySelect");
const newWeekBtn = document.getElementById("newWeekBtn");
const newDayBtn = document.getElementById("newDayBtn");

// =========================
// Config
// =========================
const API_BASE = "https://localhost:7239/api";
let currentData = [];

// =========================
// Helpers
// =========================
function showMessage(html, isError = false) {
    if (!messageBox) return;

    messageBox.classList.remove("hidden");
    messageBox.style.display = "block";
    messageBox.innerHTML = isError ? `<p class="error">${html}</p>` : html;
}

function closeModal() {
    if (modalOverlay) modalOverlay.classList.add("hidden");
    if (modalContent) modalContent.innerHTML = "";
    if (modalSave) modalSave.onclick = null;
}

if (modalCancel) {
    modalCancel.addEventListener("click", closeModal);
}

if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
}

// =========================
// Fetch + render
// =========================
async function fetchData(endpoint) {
    if (!loadingDiv || !errorDiv || !resultsContainer) return;

    loadingDiv.style.display = "block";
    errorDiv.style.display = "none";
    resultsContainer.innerHTML = "";

    try {
        const response = await fetch(`${API_BASE}/${endpoint}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
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
        renderLiftSections(data);
    } else if (endpoint === "nutritionentries") {
        renderNutritionSections(data);
    }
}

// =========================
// Card creation
// =========================
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

        <button class="manage-btn">Manage</button>

        <div class="card-actions hidden">
            <button class="update-btn">Update</button>
            <button class="delete-btn">Delete</button>
        </div>
    `;

    const manageBtn = card.querySelector(".manage-btn");
    const actions = card.querySelector(".card-actions");
    const updateBtn = card.querySelector(".update-btn");
    const deleteBtn = card.querySelector(".delete-btn");

    manageBtn.addEventListener("click", () => {
        actions.classList.toggle("hidden");
    });

    updateBtn.addEventListener("click", () => {
        updateLift(lift);
    });

    deleteBtn.addEventListener("click", () => {
        deleteLift(lift.id);
    });

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

        <button class="manage-btn">Manage</button>

        <div class="card-actions hidden">
            <button class="update-btn">Update</button>
            <button class="delete-btn">Delete</button>
        </div>
    `;

    const manageBtn = card.querySelector(".manage-btn");
    const actions = card.querySelector(".card-actions");
    const updateBtn = card.querySelector(".update-btn");
    const deleteBtn = card.querySelector(".delete-btn");

    manageBtn.addEventListener("click", () => {
        actions.classList.toggle("hidden");
    });

    updateBtn.addEventListener("click", () => {
        updateNutrition(nutrition);
    });

    deleteBtn.addEventListener("click", () => {
        deleteNutrition(nutrition.id);
    });

    return card;
}

// =========================
// CRUD - DELETE
// =========================
function deleteLift(id) {
    if (!modalOverlay || !modalTitle || !modalContent || !modalSave) {
        console.error("Modal elements missing");
        return;
    }

    modalTitle.textContent = "Delete Lift";
    modalSave.textContent = "Delete";

    modalContent.innerHTML = `
        <p class="card-body" style="text-align:center;">
            Are you sure you want to delete this lift?
        </p>
    `;

    modalOverlay.classList.remove("hidden");

    modalSave.onclick = async () => {
        try {
            const response = await fetch(`${API_BASE}/liftentries/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `DELETE failed with ${response.status}`);
            }

            closeModal();
            fetchData("liftentries");
        } catch (error) {
            console.error("Delete lift failed:", error);
        }
    };
}

function deleteNutrition(id) {
    if (!modalOverlay || !modalTitle || !modalContent || !modalSave) {
        console.error("Modal elements missing");
        return;
    }

    modalTitle.textContent = "Delete Nutrition";
    modalSave.textContent = "Delete";

    modalContent.innerHTML = `
        <p class="card-body" style="text-align:center;">
            Are you sure you want to delete this nutrition entry?
        </p>
    `;

    modalOverlay.classList.remove("hidden");

    modalSave.onclick = async () => {
        try {
            const response = await fetch(`${API_BASE}/nutritionentries/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `DELETE failed with ${response.status}`);
            }

            closeModal();
            fetchData("nutritionentries");
        } catch (error) {
            console.error("Delete nutrition failed:", error);
        }
    };
}

// =========================
// CRUD - UPDATE
// =========================
function updateLift(lift) {
    if (!modalOverlay || !modalTitle || !modalContent || !modalSave) {
        console.error("Modal elements missing");
        return;
    }

    modalTitle.textContent = "Edit Lift";
    modalSave.textContent = "Save";

    modalContent.innerHTML = `
        <div class="field">
            <span>Title</span>
            <input type="text" id="editTitle" value="${lift.title}">
        </div>
        <div class="field">
            <span>Exercise</span>
            <input type="text" id="editExercise" value="${lift.exercise}">
        </div>
        <div class="field">
            <span>Weight (kg)</span>
            <input type="number" id="editWeightKg" value="${lift.weightKg}">
        </div>
        <div class="field">
            <span>Reps</span>
            <input type="number" id="editReps" value="${lift.reps}">
        </div>
        <div class="field">
            <span>Sets</span>
            <input type="number" id="editSets" value="${lift.sets}">
        </div>
    `;

    modalOverlay.classList.remove("hidden");

    modalSave.onclick = async () => {
        const updatedLift = {
            id: lift.id,
            title: document.getElementById("editTitle").value.trim(),
            time: lift.time,
            exercise: document.getElementById("editExercise").value.trim(),
            weightKg: parseFloat(document.getElementById("editWeightKg").value),
            reps: parseInt(document.getElementById("editReps").value),
            sets: parseInt(document.getElementById("editSets").value),
            trainingDayId: lift.trainingDayId
        };

        try {
            const response = await fetch(`${API_BASE}/liftentries/${lift.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedLift)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `PUT failed with ${response.status}`);
            }

            closeModal();
            fetchData("liftentries");
        } catch (error) {
            console.error("Update lift failed:", error);
        }
    };
}

function updateNutrition(nutrition) {
    if (!modalOverlay || !modalTitle || !modalContent || !modalSave) {
        console.error("Modal elements missing");
        return;
    }

    modalTitle.textContent = "Edit Nutrition";
    modalSave.textContent = "Save";

    modalContent.innerHTML = `
        <div class="field">
            <span>Title</span>
            <input type="text" id="editNutritionTitle" value="${nutrition.title}">
        </div>
        <div class="field">
            <span>Calories</span>
            <input type="number" id="editCalories" value="${nutrition.calories}">
        </div>
        <div class="field">
            <span>Protein (g)</span>
            <input type="number" id="editProteinGrams" value="${nutrition.proteinGrams ?? 0}">
        </div>
        <div class="field">
            <span>Carbs (g)</span>
            <input type="number" id="editCarbsGrams" value="${nutrition.carbsGrams ?? 0}">
        </div>
        <div class="field">
            <span>Fat (g)</span>
            <input type="number" id="editFatGrams" value="${nutrition.fatGrams ?? 0}">
        </div>
    `;

    modalOverlay.classList.remove("hidden");

    modalSave.onclick = async () => {
        const updatedNutrition = {
            id: nutrition.id,
            title: document.getElementById("editNutritionTitle").value.trim(),
            time: nutrition.time,
            calories: parseInt(document.getElementById("editCalories").value),
            proteinGrams: parseInt(document.getElementById("editProteinGrams").value),
            carbsGrams: parseInt(document.getElementById("editCarbsGrams").value),
            fatGrams: parseInt(document.getElementById("editFatGrams").value),
            trainingDayId: nutrition.trainingDayId
        };

        try {
            const response = await fetch(`${API_BASE}/nutritionentries/${nutrition.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedNutrition)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `PUT failed with ${response.status}`);
            }

            closeModal();
            fetchData("nutritionentries");
        } catch (error) {
            console.error("Update nutrition failed:", error);
        }
    };
}

// =========================
// Navigation
// =========================
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

if (backBtn) {
    backBtn.addEventListener("click", () => {
        window.location.href = "index.html";
    });
}

// =========================
// View buttons on index page
// =========================
if (buttons.length > 0) {
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const endpoint = button.getAttribute("data-endpoint");

            if (endpoint && resultsContainer) {
                buttons.forEach(btn => btn.classList.remove("active"));
                button.classList.add("active");
                fetchData(endpoint);
            }
        });
    });
}

if (resultsContainer) {
    fetchData("liftentries");
}

// =========================
// Render sections
// =========================
function renderLiftSections(data) {
    const sectionsWrapper = document.createElement("div");
    sectionsWrapper.classList.add("results-sections");

    const grouped = {
        "Push Days": [],
        "Pull Days": [],
        "Leg Days": [],
        "Rest Days": [],
        "Other": []
    };

    data.forEach(lift => {
        const title = (lift.title || "").toLowerCase();

        if (title.includes("push")) {
            grouped["Push Days"].push(lift);
        } else if (title.includes("pull")) {
            grouped["Pull Days"].push(lift);
        } else if (title.includes("leg")) {
            grouped["Leg Days"].push(lift);
        } else if (title.includes("rest")) {
            grouped["Rest Days"].push(lift);
        } else {
            grouped["Other"].push(lift);
        }
    });

    Object.entries(grouped).forEach(([sectionName, items]) => {
        if (items.length === 0) return;

        const sectionBox = document.createElement("section");
        sectionBox.classList.add("section-box");

        const sectionTitle = document.createElement("h2");
        sectionTitle.classList.add("section-title");
        sectionTitle.textContent = sectionName;

        const cardGroup = document.createElement("div");
        cardGroup.classList.add("card-group");

        items.forEach(lift => {
            cardGroup.appendChild(createLiftCard(lift));
        });

        sectionBox.appendChild(sectionTitle);
        sectionBox.appendChild(cardGroup);
        sectionsWrapper.appendChild(sectionBox);
    });

    resultsContainer.appendChild(sectionsWrapper);
}

function renderNutritionSections(data) {
    const sectionsWrapper = document.createElement("div");
    sectionsWrapper.classList.add("results-sections");

    const grouped = {
        "Push Days": [],
        "Pull Days": [],
        "Leg Days": [],
        "Rest Days": [],
        "Other": []
    };

    data.forEach(nutrition => {
        const title = (nutrition.title || "").toLowerCase();

        if (title.includes("push")) {
            grouped["Push Days"].push(nutrition);
        } else if (title.includes("pull")) {
            grouped["Pull Days"].push(nutrition);
        } else if (title.includes("leg")) {
            grouped["Leg Days"].push(nutrition);
        } else if (title.includes("rest")) {
            grouped["Rest Days"].push(nutrition);
        } else {
            grouped["Other"].push(nutrition);
        }
    });

    Object.entries(grouped).forEach(([sectionName, items]) => {
        if (items.length === 0) return;

        const sectionBox = document.createElement("section");
        sectionBox.classList.add("section-box");

        const sectionTitle = document.createElement("h2");
        sectionTitle.classList.add("section-title");
        sectionTitle.textContent = sectionName;

        const cardGroup = document.createElement("div");
        cardGroup.classList.add("card-group");

        items.forEach(nutrition => {
            cardGroup.appendChild(createNutritionCard(nutrition));
        });

        sectionBox.appendChild(sectionTitle);
        sectionBox.appendChild(cardGroup);
        sectionsWrapper.appendChild(sectionBox);
    });

    resultsContainer.appendChild(sectionsWrapper);
}

// =========================
// Training week/day logic for AddLift
// =========================
async function loadTrainingWeeks() {
    if (!trainingWeekSelect) return;

    try {
        const response = await fetch(`${API_BASE}/trainingweeks`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to load training weeks. ${errorText}`);
        }

        const weeks = await response.json();

        trainingWeekSelect.innerHTML = `<option value="">Choose a training week</option>`;

        weeks.forEach(week => {
            const label = `${week.title} - ${week.description ?? "No description"}`;

            trainingWeekSelect.innerHTML += `
                <option value="${week.id}">
                    ${label}
                </option>
            `;
        });
    } catch (error) {
        console.error("Load training weeks failed:", error);
        showMessage(`Failed to load training weeks: ${error.message}`, true);
    }
}

async function loadTrainingDays(weekId) {
    if (!trainingDaySelect) return;

    try {
        const response = await fetch(`${API_BASE}/trainingdays`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to load training days. ${errorText}`);
        }

        const days = await response.json();

        const filteredDays = days.filter(day => day.trainingWeekId === parseInt(weekId));

        trainingDaySelect.innerHTML = `<option value="">Choose a training day</option>`;

        filteredDays.forEach(day => {
            const label = `${day.title} - ${day.description ?? "No description"}`;

            trainingDaySelect.innerHTML += `
                <option value="${day.id}">
                    ${label}
                </option>
            `;
        });
    } catch (error) {
        console.error("Load training days failed:", error);
        showMessage(`Failed to load training days: ${error.message}`, true);
    }
}

if (trainingWeekSelect) {
    trainingWeekSelect.addEventListener("change", async () => {
        const selectedWeekId = trainingWeekSelect.value;

        if (trainingDaySelect) {
            trainingDaySelect.innerHTML = `<option value="">Choose a training day</option>`;
        }

        if (!selectedWeekId) return;

        await loadTrainingDays(selectedWeekId);
    });
}

if (newWeekBtn) {
    newWeekBtn.addEventListener("click", async () => {
        const weekTitle = prompt("Enter training week title, for example: Week 1");
        if (!weekTitle || !weekTitle.trim()) return;

        const weekDescription = prompt("Enter training week description, for example: Intro week");
        if (!weekDescription || !weekDescription.trim()) return;

        const weekStartInput = prompt("Enter week start date in this format: 2026-03-20");
        if (!weekStartInput || !weekStartInput.trim()) return;

        const newWeek = {
            title: weekTitle.trim(),
            description: weekDescription.trim(),
            weekStart: new Date(weekStartInput).toISOString()
        };

        try {
            const response = await fetch(`${API_BASE}/trainingweeks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newWeek)
            });

            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(`Failed to create training week. ${responseText}`);
            }

            let createdWeek = null;
            if (responseText) {
                createdWeek = JSON.parse(responseText);
            }

            await loadTrainingWeeks();

            if (createdWeek && createdWeek.id) {
                trainingWeekSelect.value = createdWeek.id;
                await loadTrainingDays(createdWeek.id);
            }

            showMessage(`<strong>Training week created successfully.</strong>`);
        } catch (error) {
            console.error("Create training week failed:", error);
            showMessage(`Failed to create training week: ${error.message}`, true);
        }
    });
}

if (newDayBtn) {
    newDayBtn.addEventListener("click", async () => {
        const selectedWeekId = trainingWeekSelect?.value;

        if (!selectedWeekId) {
            showMessage("Choose a training week first.", true);
            return;
        }

        const dayTitle = prompt("Enter training day title, for example: Saturday");
        if (!dayTitle || !dayTitle.trim()) return;

        const dayDescription = prompt("Enter training day description, for example: Legday");
        if (!dayDescription || !dayDescription.trim()) return;

        const dayDateInput = prompt("Enter training day date in this format: 2026-03-20");
        if (!dayDateInput || !dayDateInput.trim()) return;

        const newDay = {
            title: dayTitle.trim(),
            description: dayDescription.trim(),
            date: new Date(dayDateInput).toISOString(),
            trainingWeekId: parseInt(selectedWeekId)
        };

        try {
            const response = await fetch(`${API_BASE}/trainingdays`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newDay)
            });

            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(`Failed to create training day. ${responseText}`);
            }

            let createdDay = null;
            if (responseText) {
                createdDay = JSON.parse(responseText);
            }

            await loadTrainingDays(selectedWeekId);

            if (createdDay && createdDay.id) {
                trainingDaySelect.value = createdDay.id;
            }

            showMessage(`<strong>Training day created successfully.</strong>`);
        } catch (error) {
            console.error("Create training day failed:", error);
            showMessage(`Failed to create training day: ${error.message}`, true);
        }
    });
}

// =========================
// POST - Add Lift
// =========================
if (liftForm) {
    liftForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const titleEl = document.getElementById("title");
        const timeEl = document.getElementById("time");
        const exerciseEl = document.getElementById("exercise");
        const weightKgEl = document.getElementById("weightKg");
        const repsEl = document.getElementById("reps");
        const setsEl = document.getElementById("sets");

        if (!titleEl || !timeEl || !exerciseEl || !weightKgEl || !repsEl || !setsEl || !trainingDaySelect) {
            console.error("Lift form IDs do not match script.js");
            return;
        }

        const selectedTrainingDayId = parseInt(trainingDaySelect.value);

        if (!selectedTrainingDayId) {
            showMessage("Choose a training day before creating the lift.", true);
            return;
        }

        const newLift = {
            title: titleEl.value.trim(),
            time: new Date(timeEl.value).toISOString(),
            exercise: exerciseEl.value.trim(),
            weightKg: parseFloat(weightKgEl.value),
            reps: parseInt(repsEl.value),
            sets: parseInt(setsEl.value),
            trainingDayId: selectedTrainingDayId
        };

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

            const responseText = await response.text();
            const createdLift = responseText ? JSON.parse(responseText) : null;

            showMessage(`
                <p><strong>Lift added successfully.</strong></p>
                <pre>${JSON.stringify(createdLift ?? newLift, null, 2)}</pre>
            `);

            liftForm.reset();

            if (trainingWeekSelect && trainingWeekSelect.value) {
                await loadTrainingDays(trainingWeekSelect.value);
            }
        } catch (error) {
            console.error("POST lift failed:", error);
            showMessage(`Error: ${error.message}`, true);
        }
    });
}

// =========================
// POST - Add Nutrition
// =========================
if (nutritionForm) {
    nutritionForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const titleEl = document.getElementById("nutritionTitle");
        const timeEl = document.getElementById("nutritionTime");
        const caloriesEl = document.getElementById("calories");
        const proteinEl = document.getElementById("protein");
        const carbsEl = document.getElementById("carbs");
        const fatEl = document.getElementById("fat");
        const trainingDayIdEl = document.getElementById("nutritionTrainingDayId");

        if (!titleEl || !timeEl || !caloriesEl || !proteinEl || !carbsEl || !fatEl || !trainingDayIdEl) {
            console.error("Nutrition form IDs do not match script.js");
            return;
        }

        const newNutrition = {
            title: titleEl.value.trim(),
            time: new Date(timeEl.value).toISOString(),
            calories: parseInt(caloriesEl.value),
            proteinGrams: parseInt(proteinEl.value),
            carbsGrams: parseInt(carbsEl.value),
            fatGrams: parseInt(fatEl.value),
            trainingDayId: parseInt(trainingDayIdEl.value)
        };

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

            const responseText = await response.text();
            const createdNutrition = responseText ? JSON.parse(responseText) : null;

            if (messageBox) {
                messageBox.style.display = "block";
                messageBox.classList.remove("hidden");
                messageBox.innerHTML = `
                    <p><strong>Nutrition added successfully.</strong></p>
                    <pre>${JSON.stringify(createdNutrition ?? newNutrition, null, 2)}</pre>
                `;
            }

            nutritionForm.reset();
        } catch (error) {
            console.error("POST nutrition failed:", error);
            showMessage(`Error: ${error.message}`, true);
        }
    });
}

// =========================
// Initial load for AddLift relations
// =========================
if (trainingWeekSelect) {
    loadTrainingWeeks();
}