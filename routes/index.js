var express = require("express");
var router = express.Router();
var uuid = require("uuid/v4");
var bus = require("servicebus").bus();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/cars", function(req, res, next) {
  const { io } = req.app;
  const id = uuid();

  io.emit("car created", { id: id });
  simulateCar(id, io);

  res.send("Started!");
});

function simulateCar(id, io) {
  //var _pathData = require("../bin/CarRoutes/Route" + getRandomInt(19));
  
  var randomint = getRandomInt(2);

  const fs = require('fs');
  const path = require("path");
  let rawdata = fs.readFileSync(path.resolve( process.cwd(), './bin/CarRoutes/Route' + getRandomInt(19) + '.json'));
  let _pathData = JSON.parse(rawdata);
  console.log(randomint);
  if(randomint == 1)
  {
    _pathData = _pathData.reverse();
    console.log("Reverse!");
  }

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

  var doIt = false;
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
        doIt = true;
        clearInterval(interval);
        return;
      },
      options
    );
  }, 500);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max) + 1);
}

module.exports = router;
