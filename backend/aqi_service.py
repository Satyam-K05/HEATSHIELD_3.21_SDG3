import requests

WAQI_TOKEN = "3ef0f12a16f414f8abfbfc35151fb4b923ddbd85"

def fetch_aqi_data(city):
    url = f"https://api.waqi.info/feed/{city}/"
    params = {"token": WAQI_TOKEN}

    res = requests.get(url, params=params, timeout=10)
    data = res.json()

    if data.get("status") != "ok":
        return None

    d = data["data"]

    iaqi = d.get("iaqi", {})

    return {
        "aqi": d.get("aqi", "N/A"),
        "pm25": iaqi.get("pm25", {}).get("v", "N/A"),
        "pm10": iaqi.get("pm10", {}).get("v", "N/A"),
        "no2": iaqi.get("no2", {}).get("v", "N/A"),
        "so2": iaqi.get("so2", {}).get("v", "N/A"),
        "co": iaqi.get("co", {}).get("v", "N/A"),
        "time": d.get("time", {}).get("s", "N/A"),
        "source": "WAQI"
    }
