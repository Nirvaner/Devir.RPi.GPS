var serialport = require('serialport');

var port = new serialport.SerialPort('/dev/ttyAMA0', {
    baudrate: 115200,
    parser: serialport.parsers.readline('\r\n')
});

port.on('data', function (line) {
    console.log(line);
});