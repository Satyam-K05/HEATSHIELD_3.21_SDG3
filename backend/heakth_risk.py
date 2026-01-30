def health_explanation(aqi):
    if aqi == "N/A":
        return {
            "level": "Unknown",
            "message": "Insufficient data to assess health risk."
        }

    if aqi <= 50:
        return {
            "level": "Low",
            "message": "Air quality is good. No significant health risk."
        }

    if aqi <= 150:
        return {
            "level": "Moderate",
            "message": "Sensitive groups may experience mild symptoms like coughing or irritation."
        }

    return {
        "level": "High",
        "message": "High risk for respiratory and heart conditions. Avoid outdoor activities."
        }