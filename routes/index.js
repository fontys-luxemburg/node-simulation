var express = require('express');
var router = express.Router();
var Queue = require('bull');
var Car = require('../models').Car;

var carQueue = new Queue('car simulation', 'redis://localhost:6379');

carQueue.process(function(job, done) {
  console.log('START OF JOB!', job.data.trackerId);

  var _pathData = [
    {latitude: 42.352376, longitude: -71.064548},
    {latitude: 42.353454, longitude: -71.064184},
    {latitude: 42.354707, longitude: -71.063647},
    {latitude: 42.355785, longitude: -71.062768},
    {latitude: 42.356483, longitude: -71.062016},
    {latitude: 42.357069, longitude: -71.062660},
    {latitude: 42.357672, longitude: -71.063261},
    {latitude: 42.357164, longitude: -71.064978},
    {latitude: 42.356768, longitude: -71.066844},
    {latitude: 42.356213, longitude: -71.069334},
    {latitude: 42.355832, longitude: -71.070921},
    {latitude: 42.355452, longitude: -71.072509},
    {latitude: 42.353517, longitude: -71.071479},
    {latitude: 42.351947, longitude: -71.070685},
    {latitude: 42.352566, longitude: -71.067595},
    {latitude: 42.352344, longitude: -71.064591}
  ];

  var refreshId = setInterval(function() {
    Car.findByPk(job.data.trackerId).then(car => {
      var location = _pathData.pop();

      if(!location) {
        clearInterval(refreshId);
        return;
      }

      car.update(location);
      console.log('-- UPDATE DATA WITH', location)
    })
  }, 1000);

  done();
});

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
  Car.create({ trackerId: 'test' }).then(car => {
    carQueue.add({ trackerId: car.id });
  });

  res.send('Started!');
});

module.exports = router;
