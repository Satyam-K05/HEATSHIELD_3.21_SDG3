from flask import Flask, jsonify
import requests

app = Flask(__name__)

def risk_level(pm25):
    if pm25 < 60:
        return "Low"
    elif pm25 < 120:
        return "Moderate"
    else:
        return "High"

@app.route("/")
def home():
    return jsonify({
        "project": "Air Quality Health Risk API",
        "city": "Bhopal",
        "status": "running"
    })

@app.route("/api/bhopal/aqi")
def bhopal_aqi():
    url = "https://api.openaq.org/v2/latest?city=Bhopal&limit=50"
    res = requests.get(url).json()

    output = []
    for loc in res.get("results", []):
        coords = loc.get("coordinates", {})
        for m in loc.get("measurements", []):
            if m["parameter"] == "pm25":
                output.append({
                    "location": loc["location"],
                    "lat": coords.get("latitude"),
                    "lon": coords.get("longitude"),
                    "pm25": m["value"],
                    "risk": risk_level(m["value"])
                })

    return jsonify(output)

if __name__ == "__main__":
    app.run(port=5050)
