'use strict';
module.exports = (sequelize, DataTypes) => {
  const Car = sequelize.define('Car', {
    trackerId: DataTypes.INT,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
	tripID: DataTypes.INT
  }, {});

  Car.associate = function(models) {
    // associations can be defined here
  };

  return Car;
};
