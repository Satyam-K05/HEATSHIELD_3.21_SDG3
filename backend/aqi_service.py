import requests

OPENAQ_URL = "https://api.openaq.org/v2/latest"

def safe_get(value):
    return value if value is not None else "N/A"

def calculate_risk(aqi):
    if aqi == "N/A":
        return "Unknown"
    if aqi <= 50:
        return "Low"
    elif aqi <= 150:
        return "Moderate"
    else:
        return "High"

def fetch_aqi_data(city, lat, lon):
    params = {
        "coordinates": f"{lat},{lon}",
        "radius": 10000,
        "limit": 1
    }

    response = requests.get(OPENAQ_URL, params=params, timeout=10)
    data = response.json()

    if not data.get("results"):
        return None

    measurements = data["results"][0]["measurements"]

    pollutants = {
        "pm25": "N/A",
        "pm10": "N/A",
        "no2": "N/A",
        "so2": "N/A",
        "co": "N/A"
    }

    for m in measurements:
        param = m["parameter"]
        if param in pollutants:
            pollutants[param] = round(m["value"], 2)

    # Approx AQI logic (simple & acceptable for hackathon)
    base_aqi = pollutants["pm25"]
    aqi = base_aqi if isinstance(base_aqi, (int, float)) else "N/A"

    return {
        "aqi": aqi,
        "risk": calculate_risk(aqi),
        **pollutants
    }
