var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyAMA0");

serialPort.open(function (error) {
    if (error) {
        console.log('Ошибка открытия порта: ' + error);
    } else {
        console.log('Порт открыт');
        serialPort.on('data', function (data) {
            console.log(data.toString());
        });
        serialPort.on('error', function (error) {
            console.log('Ошибка при выполнении: ' + error);
        });
        serialPort.on('close', function (data) {
            console.log('Порт был закрыт: ' + data);
        });
    }
});