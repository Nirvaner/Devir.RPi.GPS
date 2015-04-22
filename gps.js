var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyAMA0");

serialPort.on('data', function (data) {
    console.log(data.toString());
});
serialPort.on('error', function (error) {
    console.log('Error in runtime: ' + error);
});
serialPort.on('close', function (data) {
    console.log('Port closed: ' + data);
    Open();
});

function Open() {
    serialPort.open(function (error) {
        if (error) {
            console.log('Error to open port: ' + error);
        } else {
            console.log('Port opened');
        }
    });
}

Open();