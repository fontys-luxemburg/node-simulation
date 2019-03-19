document.addEventListener("DOMContentLoaded", function(){
  var socket = io();

  mapboxgl.accessToken = 'pk.eyJ1IjoiYmFra2VydG9tIiwiYSI6ImNqcmNlOWxxNzBqOXEzeXVweGU5MDVtdHcifQ.cqW0zPc4MPNR57p-2tP5aQ';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [6.0924, 49.7792],
    zoom: 8.5
  });

  fetch('/cars').then(data => data.json()).then(cars => {
    cars.map(car => {
      let marker = new mapboxgl.Marker().setLngLat([car.longitude, car.latitude]).addTo(map);
    });
    console.log('--CARS', cars);
  });
});
