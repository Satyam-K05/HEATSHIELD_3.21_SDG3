const map = L.map("map").setView([23.25, 77.41], 11);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

fetch("http://127.0.0.1:5050/api/bhopal/aqi")
.then(res => res.json())
.then(data => {
  const points = [];
  data.forEach(d => {
    if (d.lat && d.lon) {
      points.push([d.lat, d.lon, d.pm25 / 150]);
      L.circleMarker([d.lat, d.lon], {
        radius: 6,
        color: d.risk === "High" ? "red" : d.risk === "Moderate" ? "orange" : "green"
      }).addTo(map)
      .bindPopup(${d.location}<br>PM2.5: ${d.pm25}<br>Risk: ${d.risk});
    }
  });
  L.heatLayer(points).addTo(map);
});