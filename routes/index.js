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

  var amount = req.query.amountOfCars;
  var ID = req.query.ID;

  console.log("amount of cars: " + amount + " ID: " + ID);

  //Spawn cars
  for (let index = 0; index < amount; index++) {
    //ID
    let id;
    if(ID && amount == 1)
    {
      id = ID;
    }
    else
    {
      //id = uuid();
      id = Math.floor(Math.random() * 10000) + 1;
    }

    io.emit("car created", { id: id });
    simulateCar(id, io);
  }
  res.send("Started!");
});

//Simulate car
function simulateCar(id, io) { 
  //Set up requirements for route selecting
  const fs = require('fs');
  const path = require("path");
  var randomRoute = getRandomInt(29);
  console.log("Route Selected for Car " + id + ": " + randomRoute);
  
  //Get route
  let rawdata = fs.readFileSync(path.resolve( process.cwd(), './bin/CarRoutes/Route' + randomRoute + '.json'));
  let _pathData = JSON.parse(rawdata);

  //Decide if it will be in reverse
  if(getRandomInt(2) == 1)
  {
    _pathData = _pathData.reverse();
    console.log("Reverse!");
  }

  //Create simulator
  var simulator = require("../models/geolocation-simulator")({
    coords: _pathData,
    speed: Math.floor(Math.random() * (120 - 50 + 1)) + 50,
    done: false
  });

  simulator.start();

  var options = {
    enableHighAccuracy: true,
    timeout: Infinity,
    maximumAge: 0
  };

  //Update car untill finished
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
  return Math.floor(Math.random() * Math.floor(max) + 1);
}

module.exports = router;
