from flask import Flask, request, jsonify
from flask_cors import CORS
from heakth_risk import health_explanation
from india_cities import INDIA_CITIES       
from aqi_service import fetch_aqi_data
from auto_cities import fetch_india_cities
AUTO_CITIES = fetch_india_cities()
app = Flask(__name__)
CORS(app)

# ----------------------------
# Helper: Find city (case-insensitive)
# ----------------------------
def find_city(city_name):
    city_key = city_name.lower().strip()

    # 1️⃣ Check auto-fetched cities
    if city_key in AUTO_CITIES:
        return "India", AUTO_CITIES[city_key]

    # 2️⃣ Fallback to manual list
    for state, cities in INDIA_CITIES.items():
        for c in cities:
            if c["city"].lower() == city_key:
                return state.title(), c

    return None, None

# ----------------------------
# API: List all cities
# ----------------------------
@app.route("/api/cities")
def get_all_cities():
    result = []
    for cities in INDIA_CITIES.values():
        for c in cities:
            result.append(c["city"])
    return jsonify(sorted(result))

# ----------------------------
# API: AQI by city
@app.route("/api/aqi")
def get_aqi_by_city():
    city = request.args.get("city")
    if not city:
        return jsonify({"error": "City parameter is required"}), 400

    state, city_info = find_city(city)
    if not city_info:
        return jsonify({"error": "City not found"}), 404

    aqi_data = fetch_aqi_data(city_info["lat"], city_info["lon"])
    if not aqi_data:
        aqi_data = {
        "aqi": "N/A",
        "pm25": "N/A",
        "pm10": "N/A",
        "no2": "N/A",
        "so2": "N/A",
        "co": "N/A"}
    return jsonify({
        "city": city_info["city"],
        "state": state,
        "lat": city_info["lat"],
        "lon": city_info["lon"],
        "source": "OpenAQ",
        **aqi_data
    })

@app.route("/api/cities")
def get_manual_cities():
    manual = [c["city"] for cities in INDIA_CITIES.values() for c in cities]
    auto = [v["city"] for v in AUTO_CITIES.values()]
    return jsonify(sorted(set(manual + auto)))

# ----------------------------
# Health Check
# ----------------------------
@app.route("/")
def home():
    return {"status": "Backend runnlot"}


@app.route("/api/health-risk")
def get_health_risk():
    aqi = request.args.get("aqi")

    if not aqi:
        return jsonify({"error": "AQI required"}), 400

    try:
        aqi = int(float(aqi))
    except:
        aqi = "N/A"

    return jsonify(health_explanation(aqi))
if __name__ == "__main__":
    app.run(debug=True)