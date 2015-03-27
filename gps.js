var port = require('serialport').SerialPort("/dev/ttyAMA0");

port.on('data', function (data) {
    console.log(data);
});