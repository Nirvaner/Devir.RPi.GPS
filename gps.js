var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyAMA0");

serialPort.open(function (error) {
    if (error) {
        console.log('������ �������� �����: ' + error);
    } else {
        console.log('���� ������');
        serialPort.on('data', function (data) {
            console.log(data.toString());
        });
        serialPort.on('error', function (error) {
            console.log('������ ��� ����������: ' + error);
        });
        serialPort.on('close', function (data) {
            console.log('���� ��� ������: ' + data);
        });
    }
});