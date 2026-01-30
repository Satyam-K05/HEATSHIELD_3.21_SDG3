import requests

OPENAQ_LOCATIONS = "https://api.openaq.org/v2/locations"

def fetch_india_cities(limit=200):
    params = {
        "country": "IN",
        "limit": limit,
        "page": 1
    }

    response = requests.get(OPENAQ_LOCATIONS, params=params, timeout=10)
    data = response.json()

    cities = {}
    for item in data.get("results", []):
        city = item.get("city")
        coords = item.get("coordinates")

        if not city or not coords:
            continue

        key = city.lower().strip()
        if key not in cities:
            cities[key] = {
                "city": city,
                "lat": coords["latitude"],
                "lon": coords["longitude"]
            }

    return cities
