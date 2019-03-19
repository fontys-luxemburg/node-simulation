var socket = io();

mapboxgl.accessToken =
  "pk.eyJ1IjoiYmFra2VydG9tIiwiYSI6ImNqcmNlOWxxNzBqOXEzeXVweGU5MDVtdHcifQ.cqW0zPc4MPNR57p-2tP5aQ";

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  center: [6.0924, 49.7792],
  zoom: 8.5
});

let markers = {};

function addCarToMap(car) {
  var marker = markers[car.id];

  if (marker) {
    var oldLocation = marker.getLngLat();
    marker.setLngLat([car.longitude, car.latitude]);

    var rotationRadians = Math.atan((oldLocation.lat - car.latitude) / (oldLocation.lng - car.longitude));
    var RAD2DEG = 180 / Math.PI;
    var rotationDegrees = rotationRadians * RAD2DEG;

    if (Number.isNaN(rotationDegrees)) return;

    marker._element.style.transform += ` rotate(${90 + (-rotationDegrees)}deg)`;
    return;
  }

  var el = document.createElement("div");
  el.className = "marker";

  marker = new mapboxgl.Marker(el);
  marker.setLngLat([car.longitude, car.latitude]);
  marker.addTo(map);

  markers = {
    ...markers,
    [car.id]: marker
  };
}

var cars = [];

socket.on("car created", car => {
  console.log("Car created!");
  cars.push(car);
  renderCarList();
});

socket.on("car finished", car => {
  cars = cars.filter(item => {
    return item.id !== car.id;
  });

  markers[car.id].remove();

  renderCarList();
});

function renderCarList() {
  const carlistElement = document.querySelector(".car-list");

  var html = cars.map((car) => {
    return `<li onclick="panCar(\``+ car.id + `\`)">${car.id}</li>`
  }).join('');

  carlistElement.innerHTML = html;
}

function panCar(selectedCar){
  var marker = markers[selectedCar];
  map.flyTo({center: marker._lngLat, zoom: 14});
}

socket.on('car update', (car) => {
  addCarToMap(car);
});

let addCarBtn = document.querySelector("#addCarBtn");

addCarBtn.addEventListener("click", () => {
  fetch("/cars", { method: "POST" }).then(() => {});
});
