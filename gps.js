var SerialPort = require('serialport').SerialPort();

var gpsPort = new SerialPort("/dev/ttyAMA0");

gpsPort.on('data', function (data) {
    console.log(data);
});