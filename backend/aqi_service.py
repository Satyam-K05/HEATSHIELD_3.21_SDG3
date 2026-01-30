import requests

def fetch_aqi_data(lat, lon):
    try:
        url = "https://api.openaq.org/v2/latest"
        params = {
            "coordinates": f"{lat},{lon}",
            "radius": 5000,
            "limit": 1
        }

        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()
        pollutants = {}

        results = data.get("results", [])
        if not results:
            return {}

        measurements = results[0].get("measurements", [])

        for m in measurements:
            param = m.get("parameter")
            value = m.get("value")
            if param and value is not None:
                pollutants[param] = value

        return {
            "aqi": pollutants.get("pm25", "N/A"),
            "pm25": pollutants.get("pm25", "N/A"),
            "pm10": pollutants.get("pm10", "N/A"),
            "no2": pollutants.get("no2", "N/A"),
            "so2": pollutants.get("so2", "N/A"),
            "co": pollutants.get("co", "N/A")
        }

    except Exception as e:
        print("AQI fetch error:", e)
        return {}
