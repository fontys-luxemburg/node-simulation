var express = require("express");
var router = express.Router();
var uuid = require("uuid/v4");
var bus = require("servicebus").bus();
var amqp = require('amqplib/callback_api');
const JSON5 = require('json5')
const path = "http://localhost:8080/tracking.war/api/trackers/available";
const tripPath = "http://localhost:8080/tracking.war/api/trips/newid"; 
var axios = require("axios");

var trackers;
var trip;

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

 router.post("/cars", async function(req, res, next) {
  const { io } = req.app;

  //Spawn cars
  await getUUID();

  for (tracker in trackers){
    var id = tracker.trackerId;

    await getTripID();
    var tripID = trip;

    io.emit("car created", {id: id});
    simulateCar(id, tripID, io);
  }

  res.send("Started!");
});

//Simulate car
function simulateCar(id, tripID, io) { 
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
    maximumAge: 0,
	durable: false,
	auto_delete:false
  };


  //Update car untill finished
  var interval = setInterval(function() {
    simulator.getCurrentPosition(
      function(data) {
	 
        const { latitude, longitude } = data.coords;
        bus.send("TrackingQueue",{
          trackerID: id,
          tripID: tripID,
          longitude: longitude,
          latitude: latitude,
          trackedAt: new Date()
        });
		var obj = JSON5.stringify({
          trackerID: id,
          tripID: tripID,
          longitude: longitude,
          latitude: latitude,
          trackedAt: new Date()
        });
		console.log(obj);
		 amqp.connect('amqp://localhost', function(err, conn) {
			conn.createChannel(function(err, ch) {
			var q = 'TrackingQueue';

			ch.assertQueue(q, {durable: false});
			// Note: on Node 6 Buffer.from(msg) should be used
			ch.sendToQueue(q, new Buffer(obj));
			console.log(" [x] Sent 'Hello World!'");
			});
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

async function getUUID() {
 
  console.log('path = ' + path);

  await axios({
    method: 'GET',
    url: path,
    data: {}
  })
  .then(response => {
    console.log("UUID van tracking");
    trackers = response.data;
  })
  .catch(e => {
    console.log('Kan geen trackers vinden');
    console.log(e);
  })
  return;
}

async function getTripID(){

  await axios({
    method: 'GET',
    url: tripPath,
    data: {}
  })
  .then(response => {
    trip = response.data;
  })
  .catch(e => {
    console.log("Kan geen trip vinden");
    console.log(e);
  })  
}

module.exports = router;
