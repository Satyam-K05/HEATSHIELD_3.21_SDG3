// ============================================
// AIR QUALITY DASHBOARD - MAIN SCRIPT
// ============================================

// Global variables for chart instances
let pollutionChart = null;
let aqiMap = null;
let aqiMarker = null;

// ============================================
// API CONFIGURATION
// ============================================

const API_BASE_URL = 'http://127.0.0.1:5000'; // Update with your Flask API URL

// ============================================
// FETCH AQI DATA FROM BACKEND
// ============================================

async function fetchAQIData(city) {
  try {
    // Show loading state
    showLoading();

    // Call Flask API
    const response = await fetch(${API_BASE_URL}/api/aqi?city=${encodeURIComponent(city)}, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Handle HTTP errors
    if (!response.ok) {
      throw new Error(API Error: ${response.status} ${response.statusText});
    }

    // Parse JSON response
    const data = await response.json();

    // Validate data structure
    if (!data  data.aqi === undefined) {
      throw new Error('Invalid API response format');
    }

    // Update UI with real data
    updateUI(data);
    renderCharts(data);
    renderMap(data);

    // Hide loading state
    hideLoading();

    return data;

  } catch (error) {
    // Show error message
    showError(error.message);
    hideLoading();
    console.error('Error fetching AQI data:', error);
  }
}

// ============================================
// UPDATE UI WITH API DATA
// ============================================

function updateUI(data) {
  // Update city name
  const cityElement = document.getElementById('city-name');
  if (cityElement) {
    cityElement.textContent = data.city;
  }

  // Update AQI value
  const aqiElement = document.getElementById('aqi-value');
  if (aqiElement) {
    aqiElement.textContent = data.aqi;
  }

  // Update risk level
  const riskElement = document.getElementById('risk-level');
  if (riskElement) {
    riskElement.textContent = data.risk;
    // Add color coding based on risk
    riskElement.className = 'risk-badge';
    if (data.risk === 'Low') {
      riskElement.classList.add('risk-low');
    } else if (data.risk === 'Moderate') {
      riskElement.classList.add('risk-moderate');
    } else if (data.risk === 'High') {
      riskElement.classList.add('risk-high');
    }
  }

  // Update pollution parameters
  const pm25Element = document.getElementById('pm25-value');
  if (pm25Element) {
    pm25Element.textContent = ${data.pm25} μg/m³;
  }

  const pm10Element = document.getElementById('pm10-value');
  if (pm10Element) {
    pm10Element.textContent = ${data.pm10} μg/m³;
  }

  const no2Element = document.getElementById('no2-value');
  if (no2Element) {
    no2Element.textContent = ${data.no2} μg/m³;
  }

  const so2Element = document.getElementById('so2-value');
  if (so2Element) {
    so2Element.textContent = ${data.so2} μg/m³;
  }

  const coElement = document.getElementById('co-value');
  if (coElement) {
    co2Element.textContent = ${data.co} μg/m³;
  }

  // Update AQI description based on value
  updateAQIDescription(data.aqi);
}

// ============================================
// UPDATE AQI DESCRIPTION
// ============================================

function updateAQIDescription(aqi) {
  const descriptionElement = document.getElementById('aqi-description');
  if (!descriptionElement) return;

  let description = '';
  
  if (aqi <= 50) {
    description = 'Good - Air quality is satisfactory, and air pollution poses little or no risk.';
  } else if (aqi <= 100) {
    description = 'Moderate - Air quality is acceptable. However, there may be a risk for some people.';
} else if (aqi <= 150) {
    description = 'Unhealthy for Sensitive Groups - Members of sensitive groups may experience health effects.';
  } else if (aqi <= 200) {
    description = 'Unhealthy - Everyone may begin to experience health effects.';
  } else if (aqi <= 300) {
    description = 'Very Unhealthy - Health alert: everyone may experience more serious health effects.';
  } else {
    description = 'Hazardous - Health warnings of emergency conditions. The entire population is likely to be affected.';
  }

  descriptionElement.textContent = description;
}

// ============================================
// RENDER POLLUTION CHARTS (Chart.js)
// ============================================

function renderCharts(data) {
  const chartCanvas = document.getElementById('pollution-chart');
  if (!chartCanvas) {
    console.warn('Chart canvas element not found');
    return;
  }

  // Destroy existing chart if it exists
  if (pollutionChart) {
    pollutionChart.destroy();
  }

  // Get chart context
  const ctx = chartCanvas.getContext('2d');

  // Create new chart
  pollutionChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO'],
      datasets: [{
        label: 'Pollution Levels (μg/m³)',
        data: [
          data.pm25 || 0,
          data.pm10 || 0,
          data.no2 || 0,
          data.so2 || 0,
          data.co || 0
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Concentration (μg/m³)'
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: true,
          text: 'Pollution Parameters'
        }
      }
    }
  });
}

// ============================================
// RENDER MAP WITH HEATMAP (Leaflet.js)
// ============================================

function renderMap(data) {
  const mapContainer = document.getElementById('aqi-map');
  if (!mapContainer) {
    console.warn('Map container element not found');
    return;
  }

  // Initialize map if it doesn't exist
  if (!aqiMap) {
    aqiMap = L.map('aqi-map').setView([data.lat, data.lon], 11);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(aqiMap);
  } else {
    // Update map center
    aqiMap.setView([data.lat, data.lon], 11);
  }

  // Remove existing marker if it exists
  if (aqiMarker) {
    aqiMap.removeLayer(aqiMarker);
  }

  // Determine marker color based on AQI
  let markerColor = 'green';
  if (data.aqi > 200) {
    markerColor = 'darkred';
  } else if (data.aqi > 150) {
    markerColor = 'red';
  } else if (data.aqi > 100) {
    markerColor = 'orange';
  } else if (data.aqi > 50) {
    markerColor = 'yellow';
  }

  // Create custom icon
  const aqiIcon = L.divIcon({
    className: 'aqi-marker',
    html: <div style="background-color: ${markerColor}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 12px;">${data.aqi}</div>,
    iconSize: [30, 30]
  });

  // Add marker with popup
  aqiMarker = L.marker([data.lat, data.lon], { icon: aqiIcon }).addTo(aqiMap);
  
  aqiMarker.bindPopup(
    <strong>${data.city}</strong><br>
    AQI: ${data.aqi}<br>
    Risk: ${data.risk}
  ).openPopup();
// Add circle overlay for heatmap effect
  L.circle([data.lat, data.lon], {
    color: markerColor,
    fillColor: markerColor,
    fillOpacity: 0.2,
    radius: 5000
  }).addTo(aqiMap);
}

// ============================================
// LOADING STATE MANAGEMENT
// ============================================

function showLoading() {
  const loader = document.getElementById('loading-indicator');
  if (loader) {
    loader.style.display = 'block';
  }

  const content = document.getElementById('main-content');
  if (content) {
    content.style.opacity = '0.5';
  }
}

function hideLoading() {
  const loader = document.getElementById('loading-indicator');
  if (loader) {
    loader.style.display = 'none';
  }

  const content = document.getElementById('main-content');
  if (content) {
    content.style.opacity = '1';
  }
}

// ============================================
// ERROR STATE MANAGEMENT
// ============================================

function showError(message) {
  const errorContainer = document.getElementById('error-message');
  if (errorContainer) {
    errorContainer.textContent = Error: ${message};
    errorContainer.style.display = 'block';
  }
}

function hideError() {
  const errorContainer = document.getElementById('error-message');
  if (errorContainer) {
    errorContainer.style.display = 'none';
  }
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

function handleSearch() {
  const searchInput = document.getElementById('city-search');
  if (!searchInput) return;

  const city = searchInput.value.trim();
  
  if (city === '') {
    showError('Please enter a city name');
    return;
  }

  hideError();
  fetchAQIData(city);
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // Search button click
  const searchButton = document.getElementById('search-button');
  if (searchButton) {
    searchButton.addEventListener('click', handleSearch);
  }

  // Enter key press in search input
  const searchInput = document.getElementById('city-search');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        handleSearch();
      }
    });
  }

  // Load default city on page load (optional)
  const defaultCity = 'Bhopal';
  fetchAQIData(defaultCity);
});

// ============================================
// UTILITY: REFRESH DATA
// ============================================

function refreshData() {
  const searchInput = document.getElementById('city-search');
  const city = searchInput ? searchInput.value.trim() : 'Bhopal';
  
  if (city) {
    fetchAQIData(city);
  }
}

// Optional: Auto-refresh every 5 minutes
// setInterval(refreshData, 300000);
