from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return "API WORKING ✅"

# Dummy AQI data (India cities)
@app.route("/aqi")
def aqi_data():
    data = [
        {"city": "Delhi", "lat": 28.61, "lon": 77.20, "aqi": 320},
        {"city": "Mumbai", "lat": 19.07, "lon": 72.87, "aqi": 180},
        {"city": "Bhopal", "lat": 23.25, "lon": 77.41, "aqi": 140},
        {"city": "Indore", "lat": 22.72, "lon": 75.85, "aqi": 160},
    ]
    return jsonify(data)

if __name__ == "__main__":
    app.run(port=5050)
import requests
from flask import jsonify,Flask
app = Flask(__name__)
@app.route("/bhopal_aqi")
def bhopal_aqi():
    url = "https://api.openaq.org/v2/latest?city=Bhopal&limit=50"
    r = requests.get(url).json()

    result = []
    for loc in r["results"]:
        for m in loc["measurements"]:
            if m["parameter"] == "pm25":
                result.append({
                    "location": loc["location"],
                    "lat": loc["coordinates"]["latitude"],
                    "lon": loc["coordinates"]["longitude"],
                    "pm25": m["value"]
                })

    return jsonify(result)