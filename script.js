const DEFAULT_API_BASE_URL = "https://localhost:7239/api";
const API_BASE_URL_KEY = "bodycore-api-base-url";

function getApiBaseUrl() {
  return (localStorage.getItem(API_BASE_URL_KEY) || DEFAULT_API_BASE_URL).replace(/\/$/, "");
}

function setApiBaseUrl(value) {
  const normalizedValue = value.trim().replace(/\/$/, "");
  localStorage.setItem(API_BASE_URL_KEY, normalizedValue || DEFAULT_API_BASE_URL);
}

function syncApiUrlInputs() {
  const inputs = document.querySelectorAll("[data-api-base-url]");
  const currentValue = getApiBaseUrl();

  inputs.forEach((input) => {
    input.value = currentValue;

    input.addEventListener("change", () => {
      setApiBaseUrl(input.value);
      const updatedValue = getApiBaseUrl();

      inputs.forEach((item) => {
        item.value = updatedValue;
      });
    });
  });
}

async function fetchJson(path) {
  const url = `${getApiBaseUrl()}${path}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function renderJson(output, data) {
  output.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
}

function renderError(output, error) {
  const helpText =
    error instanceof TypeError
      ? "Could not reach the API. Double-check the API URL, that the backend is running, the HTTPS certificate is trusted, and CORS is enabled."
      : error.message;

  output.innerHTML = `<p class="error">${helpText}</p>`;
  console.error(error);
}

function wireLoadButton(buttonId, outputId, path) {
  const button = document.getElementById(buttonId);
  const output = document.getElementById(outputId);

  if (!button || !output) {
    return;
  }

  button.addEventListener("click", async () => {
    output.innerHTML = "<p>Loading...</p>";

    try {
      const data = await fetchJson(path);
      renderJson(output, data);
    } catch (error) {
      renderError(output, error);
    }
  });
}

syncApiUrlInputs();
wireLoadButton("loadLiftsBtn", "liftOutput", "/liftentries");
wireLoadButton("loadNutritionBtn", "nutritionOutput", "/nutritionentries");
