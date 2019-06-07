var express = require("express");
var router = express.Router();
var uuid = require("uuid/v4");
var bus = require("servicebus").bus();
var amqp = require('amqplib/callback_api');
const JSON5 = require('json5')
const path = "http://localhost:8080/tracking/api/trackers";
var axios = require("axios");

var uuidP;

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

 router.post("/cars", async function(req, res, next) {
  const { io } = req.app;

  var amount = req.query.amountOfCars;
  var ID = req.query.ID;

  console.log("amount of cars: " + amount + " ID: " + ID);

  //Spawn cars
  for (let index = 0; index < amount; index++) {
    //ID
    var id;
    if(ID && amount == 1)
    {
      id = ID;
    }
    else
    {
      await getUUID();
      console.log("UUID: " + uuidP);
      id = uuidP;
    }

    //Get een nieuwe TripID
    //Gebruik een await anders gaat het programma door
    //Dit werkt alleen als er async voor de function staat die je aanroept zie getUUID
    var tripID = 1;

    io.emit("car created", { id: id });
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
          tripID: id,
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
    method: 'POST',
    url: path,
    data: {}
  })
  .then(response => {
    console.log("UUID van tracking");
    uuidP = response.data;
  })
  .catch(e => {
    console.log('id wordt UUID gezet');
    console.log(e);
    uuidP = uuid();
  })
  return;
}

module.exports = router;
