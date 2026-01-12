/* =========================
   SHUG LOCATIONS (FIXED)
   ========================= */
const locations = [
  {
    name: "SHUG Sektion Kiel – Auditorium Maximum",
    type: "sektion",
    city: "Kiel",
    lat: 54.3386,
    lng: 10.1226
  },
  {
    name: "SHUG Geschäftsstelle – Alte Universitätsbibliothek",
    type: "geschaeftsstelle",
    city: "Kiel",
    lat: 54.3402,
    lng: 10.1159
  },
  {
    name: "SHUG Sektion Altenholz – Rathaus Altenholz-Stift",
    type: "sektion",
    city: "Altenholz",
    lat: 54.3986,
    lng: 10.1273
  },
  {
    name: "SHUG Sektion Plön – Max-Planck-Institut",
    type: "sektion",
    city: "Plön",
    lat: 54.1624,
    lng: 10.4196
  },
  {
    name: "SHUG Sektion Bordesholm – Haus der Kirche",
    type: "sektion",
    city: "Bordesholm",
    lat: 54.1736,
    lng: 10.0412
  },
  {
    name: "SHUG Sektion Reinbek – Stadtbibliothek",
    type: "sektion",
    city: "Reinbek",
    lat: 53.5087,
    lng: 10.2487
  },
  {
    name: "SHUG Sektion Glinde – Glinder Mühle",
    type: "sektion",
    city: "Glinde",
    lat: 53.5419,
    lng: 10.2155
  },
  {
    name: "SHUG Sektion Sylt – Schulzentrum Westerland",
    type: "sektion",
    city: "Westerland",
    lat: 54.9077,
    lng: 8.3125
  }
];

/* =========================
   MAP SETUP
   ========================= */
const germanyBounds = [
  [47.2, 5.8],
  [55.1, 15.0]
];

const map = L.map("map", {
  center: [51.1657, 10.4515],
  zoom: 6,
  minZoom: 6,
  maxZoom: 18,
  maxBounds: germanyBounds,
  maxBoundsViscosity: 1.0
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: "© OpenStreetMap"
}).addTo(map);

map.fitBounds(germanyBounds);

let markers = [];

/* =========================
   RENDER
   ========================= */
function render() {
  const search = document.getElementById("search").value.toLowerCase();
  const type = document.getElementById("type").value;
  const cards = document.getElementById("cards");

  cards.innerHTML = "";
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  locations
    .filter(l =>
      l.name.toLowerCase().includes(search) &&
      (!type || l.type === type)
    )
    .forEach(loc => {
      const marker = L.circleMarker([loc.lat, loc.lng], {
        radius: 8,
        fillColor: "#005aa3",
        color: "#ffffff",
        weight: 2,
        fillOpacity: 1
      }).addTo(map);

      marker.bindPopup(`<strong>${loc.name}</strong><br>${loc.city}`);
      markers.push(marker);

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${loc.name}</h3>
        <span>${loc.city}</span>
      `;

      card.onclick = () => {
        map.setView([loc.lat, loc.lng], 15, { animate: true });
        marker.openPopup();
      };

      cards.appendChild(card);
    });
}

document.getElementById("search").addEventListener("input", render);
document.getElementById("type").addEventListener("change", render);

render();
