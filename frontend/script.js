// ===============================
// CONFIG
// ===============================
const API_BASE = "https://heatshield-3-21-sdg3-1.onrender.com/";

// ===============================
// AQI COLOR CLASS
// ===============================
function getAqiClass(aqi) {
  aqi = Number(aqi);
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "usg";
  if (aqi <= 200) return "unhealthy";
  if (aqi <= 300) return "very-unhealthy";
  return "hazardous";
}

// ===============================
// FETCH AQI FROM BACKEND
// ===============================
async function loadCity(city) {
  try {
    const res = await fetch(`${API_BASE}/api/aqi?city=${city}`);
    const data = await res.json();

    if (data.error) {
      alert("No AQI data available");
      return;
    }

    // Update UI with real data
    updateUI(data);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

// ===============================
// UPDATE UI
// ===============================
function updateUI(data) {
  const aqi = data.aqi || "--";
  const cls = getAqiClass(aqi);

  // City name
  document.getElementById("cityName").innerText =
    `${data.city}, ${data.state || "India"}`;

  // Big AQI box
  const aqiBox = document.getElementById("cityAqiLarge");
  aqiBox.innerText = aqi;
  aqiBox.className = "city-aqi-large " + cls;

  // Pollutants
  setText("pm25", data.pm25);
  setText("pm25Val", data.pm25, " μg/m³");
  setText("pm10Val", data.pm10, " μg/m³");
  setText("no2Val", data.no2, " ppb");
  setText("so2Val", data.so2, " ppb");
  setText("coVal", data.co, " ppm");

  // Bars
  setBar("pm25Bar", data.pm25, cls);
  setBar("pm10Bar", data.pm10, cls);
  setBar("no2Bar", data.no2, cls);
  setBar("so2Bar", data.so2, cls);
  setBar("coBar", data.co, cls);

  // Update time
  const timeEl = document.getElementById("updateTime");
  if (timeEl && data.time) {
    timeEl.innerText = data.time;
  }
}

// ===============================
// TEXT SETTER
// ===============================
function setText(id, value, unit = "") {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerText = value ? value + unit : "--";
}

// ===============================
// PROGRESS BAR
// ===============================
function setBar(id, value, cls) {
  const bar = document.getElementById(id);
  if (!bar) return;

  if (!value || value === "N/A") {
    bar.style.width = "10%";
    return;
  }

  let percent = Math.min(Number(value), 100);
  bar.style.width = percent + "%";
  bar.className = "progress-fill " + cls;
}

// ===============================
// CITY CLICK EVENTS
// ===============================
document.querySelectorAll(".city-item").forEach(el => {
  el.addEventListener("click", () => {
    const city = el.dataset.city;
    loadCity(city);

    // Active highlight
    document.querySelectorAll(".city-item").forEach(c =>
      c.classList.remove("active")
    );
    el.classList.add("active");
  });
});

// ===============================
// REFRESH BUTTON
// ===============================
const refreshBtn = document.getElementById("refreshBtn");
if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    const city = document
      .getElementById("cityName")
      .innerText.split(",")[0];
    loadCity(city);
  });
}

// ===============================
// INITIAL LOAD
// ===============================
loadCity("Delhi");
