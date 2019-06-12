const logger = require('./logger')

let serialData = {}

// function to provide access to the serial data
const getLastMeasurement = () => {
  logger.debug('measurement::getLastMeasurmeent: retrieving last data')
  return serialData
}

// function to store the last serial data
const setLastMeasurement = (serialdata) => {
  logger.debug('measurement::setLastMeasurmeent: storing last data')
  serialData = serialdata
}

module.exports = {
  getLastMeasurement: getLastMeasurement,
  setLastMeasurement: setLastMeasurement
}
