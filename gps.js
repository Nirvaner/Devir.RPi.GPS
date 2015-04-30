const Host = '192.168.66.100';
const Port = 11112;

var dataQueue = [];

var packet = {
    Time: 0,
    Longitude: 0,
    Latitude: 0,
    Altitude: 0,
    Satellites: 0
};

var nmeaString = '';

var SerialPort = require("serialport")
var serialPort = new SerialPort.SerialPort("/dev/ttyAMA0", {
    baudrate: 9600,
}, false);

serialPort.on('error', function (error) {
    console.log('Error in runtime: ' + error);
});
serialPort.on('close', function (data) {
    console.log('Port closed: ' + data);
});
serialPort.on('data', function (data) {
    var s = data.toString();
    var index = s.indexOf('\n');
    if (index == -1) {
        nmeaString += s;
    }
    else {
        nmeaString += s.substring(0, index + 1);
        if (nmeaString.substring(3, 6) == 'GGA') {
            var nmeaArr = nmeaString.split(',');
            packet.Time = nmeaArr[1];
            packet.Longitude = nmeaArr[4].replace('.', '') * 1;
            packet.Latitude = nmeaArr[2].replace('.', '') * 1;
            packet.Altitude = nmeaArr[9];
            packet.Satellites = nmeaArr[7];
        }
        nmeaString = s.substring(index + 1);
    }
});
serialPort.open(function (error) {
    if (error) {
        console.log('Error to open port: ' + error);
    } else {
        console.log('Port opened');
    }
});

var Logic = setInterval(function () {
    try {
        //console.log('Time: ' + packet.Time);
        //console.log('Latitude: ' + packet.Latitude);
        //console.log('Longitude: ' + packet.Longitude);
        //console.log('Altitude: ' + packet.Altitude);
        //console.log('Satellites: ' + packet.Satellites);
        if (dataQueue.length > 10000)
            dataQueue.shift();
        dataQueue.push(packet);
    }
    catch (error) {
        console.log(error);
    }
}, 1000);

var net = require('net');
var client;
var step = 0;

client = net.connect({ port: Port, host: Host }, function () {
    console.log('Tcp port open');
    client.on('end', function () { console.log('Tcp disconnect') });
});

//$GPRMC,084120.00,A,5108.22102,N,07125.31107,E,0.026,,230415,,,D*75 // Минимально - рекомендованый набор данных
//$GPVTG,,T,,M,0.026,N,0.049,K,D*2F // Вектор движения и скорости
//$GPGGA,084120.00,5108.22102,N,07125.31107,E,2,11,0.84,388.0,M,-33.3,M,,0000*7B // Информация о фиксированном решении
//$GPGSA,A,3,09,07,16,23,27,30,10,19,20,05,28,,2.14,0.84,1.97*0C // Общая информация о спутниках
//$GPGSV,4,1,14,05,17,315,26,07,72,295,20,09,56,180,42,10,23,250,36*70 // Детальная информация о спутниках
//$GPGSV,4,2,14,16,30,053,23,19,35,121,30,20,20,296,27,21,03,021,20*7F
//$GPGSV,4,3,14,23,29,158,36,26,03,053,27,27,40,080,24,28,09,225,24*73
//$GPGSV,4,4,14,30,40,279,29,39,17,233,34*75
//$GPGLL,5108.22102,N,07125.31107,E,084120.00,A,D*69 // Данные широты и долготы