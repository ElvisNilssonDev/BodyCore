const apiBaseUrl = "https://localhost:7239/api";

const liftBtn = document.getElementById("loadLiftsBtn");
const nutritionBtn = document.getElementById("loadNutritionBtn");

if (liftBtn) {
  liftBtn.addEventListener("click", async () => {
    const output = document.getElementById("liftOutput");

    try {
      const response = await fetch(`${apiBaseUrl}/liftentries`);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      output.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    } catch (error) {
      output.textContent = "Error: " + error.message;
      console.error(error);
    }
  });
}

if (nutritionBtn) {
  nutritionBtn.addEventListener("click", async () => {
    const output = document.getElementById("nutritionOutput");

    try {
      const response = await fetch(`${apiBaseUrl}/nutritionentries`);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      output.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    } catch (error) {
      output.textContent = "Error: " + error.message;
      console.error(error);
    }
  });
}