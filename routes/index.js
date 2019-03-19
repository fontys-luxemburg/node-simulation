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
  var _pathData = [
    {longitude: 6.09643, latitude: 49.82378},
    {longitude: 6.09667, latitude: 49.82461},
    {longitude: 6.09667, latitude: 49.82461},
    {longitude: 6.09608, latitude: 49.82479},
    {longitude: 6.09594, latitude: 49.82484},
    {longitude: 6.09594, latitude: 49.82484},
    {longitude: 6.09596, latitude: 49.82496},
    {longitude: 6.09603, latitude: 49.82554},
    {longitude: 6.09621, latitude: 49.82663},
    {longitude: 6.0963, latitude: 49.82723},
    {longitude: 6.09629, latitude: 49.82745},
    {longitude: 6.09626, latitude: 49.82812},
    {longitude: 6.09626, latitude: 49.82822},
    {longitude: 6.09618, latitude: 49.82966},
    {longitude: 6.09621, latitude: 49.82996},
    {longitude: 6.09625, latitude: 49.8301},
    {longitude: 6.09639, latitude: 49.83053},
    {longitude: 6.09653, latitude: 49.83084},
    {longitude: 6.09654, latitude: 49.83087},
    {longitude: 6.09656, latitude: 49.8309},
    {longitude: 6.09667, latitude: 49.83113},
    {longitude: 6.09671, latitude: 49.8312},
    {longitude: 6.09675, latitude: 49.83127},
    {longitude: 6.09679, latitude: 49.83134},
    {longitude: 6.09688, latitude: 49.83146},
    {longitude: 6.0969, latitude: 49.83149},
    {longitude: 6.09704, latitude: 49.83164},
    {longitude: 6.0973, latitude: 49.83195},
    {longitude: 6.09735, latitude: 49.83201},
    {longitude: 6.09745, latitude: 49.8322},
    {longitude: 6.09747, latitude: 49.83233},
    {longitude: 6.09751, latitude: 49.83253},
    {longitude: 6.09753, latitude: 49.83278},
    {longitude: 6.09757, latitude: 49.83317},
    {longitude: 6.09757, latitude: 49.8332},
    {longitude: 6.09757, latitude: 49.83331},
    {longitude: 6.09757, latitude: 49.83365},
    {longitude: 6.09758, latitude: 49.83435},
    {longitude: 6.09758, latitude: 49.83435},
    {longitude: 6.09773, latitude: 49.83434},
    {longitude: 6.09898, latitude: 49.83426},
    {longitude: 6.09906, latitude: 49.83422},
    {longitude: 6.09911, latitude: 49.83417},
    {longitude: 6.09912, latitude: 49.83413},
    {longitude: 6.09912, latitude: 49.83413}
  ];

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

module.exports = router;
