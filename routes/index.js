var express = require("express");
var router = express.Router();
var uuid = require("uuid/v4");
var bus = require("servicebus").bus();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/cars", function(req, res, next) {
  Car.findAll().then(cars => {
    res.send(JSON.stringify(cars));
  });
});

router.post("/cars", function(req, res, next) {
  const { io } = req.app;

  const id = uuid();
  io.emit("car created", { id: id });
  simulateCar(id, io);

  res.send("Started!");
});

function simulateCar(id, io) {
  var _pathData = require("../bin/CarRoutes/Route" + getRandomInt(21));
  var simulator = require("../models/geolocation-simulator")({
    coords: _pathData,
    speed: Math.floor(Math.random() * (120 - 50 + 1)) + 50
  });

  simulator.start();

  var options = {
    enableHighAccuracy: true,
    timeout: Infinity,
    maximumAge: 0
  };

  var interval = setInterval(function() {
    simulator.getCurrentPosition(
      function(data) {
        const { latitude, longitude } = data.coords;

        bus.send("TrackingQueue", {
          trackerID: id,
          tripID: 12,
          longitude: longitude,
          latitude: latitude,
          trackedAt: new Date()
        });

        io.emit("car update", { id: id, ...data.coords });
      },
      function() {
        io.emit("car finished", { id });
        clearInterval(interval);
        return;
      },
      options
    );
  }, 500);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

module.exports = router;
