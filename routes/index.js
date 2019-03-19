var express = require('express');
var router = express.Router();
var uuid = require('uuid/v4');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/cars', function(req, res, next) {
  Car.findAll().then(cars => {
    res.send(JSON.stringify(cars));
  });
});

router.post('/cars', function(req, res, next) {
  const { io } = req.app;
  const id = uuid();

  io.emit('car created', { id: id });
  updateCar(id, io);

  res.send('Started!');
});

function updateCar(id, io) {
  var _pathData = require('../bin/CarRoutes/Route' + getRandomInt(21));

  var interval = setInterval(function() {
    var location = _pathData.pop();

    if(!location) {
      clearInterval(interval);
      io.emit('car finished', { id });
      return;
    }

    io.emit('car update', { id: id, ...location });
  }, 1000);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

module.exports = router;
