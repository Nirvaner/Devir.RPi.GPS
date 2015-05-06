const Host = '192.168.66.100';
const Port = 11112;
const Imei = '000000000000000';
const MaxPackets = 10000; // Maximum packets count in memory
const MinPackets = 1; // Minimum packets count for send to server

const SerialPortGPS = '/dev/ttyAMA0';

var dataQueue = [];

var packet = {
    DateTime: 0,
    Longitude: 0,
    Latitude: 0,
    Altitude: 0,
    Angle: 0,
    Speed: 0,
    Satellites: 0,
    PDOP: 0,
    HDOP: 0,
    VDOP: 0
};

var pack = packet;

var nmeaString = '';

var Int64 = require('node-int64');

var SerialPort = require("serialport");
var serialPort = new SerialPort.SerialPort(SerialPortGPS, {
    baudrate: 9600
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
    while (index != -1) {
        nmeaString += s.substring(0, index + 1);
        var nmeaArr = nmeaString.split(',');
        if (nmeaString.substring(3, 6) == 'RMC') {
            packet = pack;
            var year = '20' + nmeaArr[9].substring(4);
            var month = nmeaArr[9].substring(2, 4);
            var day = nmeaArr[9].substring(0, 2);
            var hour = nmeaArr[1].substring(0, 2);
            var minute = nmeaArr[1].substring(2, 4);
            var second = nmeaArr[1].substring(4);
            pack.DateTime = new Date(year, month - 1, day, hour, minute, second).getTime();
            pack.Time = nmeaArr[1];
            pack.Speed = nmeaArr[7] * 1.852;
            pack.Angle = nmeaArr[8];
        }
        else if (nmeaString.substring(3, 6) == 'GGA') {
            pack.Longitude = nmeaArr[4].replace('.', '') * 1;
            pack.Latitude = nmeaArr[2].replace('.', '') * 1;
            pack.Altitude = nmeaArr[9];
            pack.Satellites = nmeaArr[7];
        }
        else if (nmeaString.substring(3, 6) == 'GSA') {
            pack.PDOP = nmeaArr[15];
            pack.HDOP = nmeaArr[16];
            pack.VDOP = nmeaArr[17].split('*')[0];
        }
        nmeaString = '';
        s = s.substring(index + 1);
        index = s.indexOf('\n');
    }
    nmeaString += s;
});
serialPort.open(function (error) {
    if (error) {
        console.log('Error to open port: ' + error);
    } else {
        console.log('Port opened');
    }
});

var LogicInterval = setInterval(function () {
    try {
        console.log('DateTime: ' + new Date(packet.DateTime));
        console.log('Latitude: ' + packet.Latitude);
        console.log('Longitude: ' + packet.Longitude);
        console.log('Altitude: ' + packet.Altitude);
        console.log('Angle: ' + packet.Angle);
        console.log('Speed: ' + packet.Speed);
        console.log('Satellites: ' + packet.Satellites);
        console.log('PDOP: ' + packet.PDOP);
        console.log('HDOP: ' + packet.HDOP);
        console.log('VDOP: ' + packet.VDOP);
        if (dataQueue.length > MaxPackets) {
            dataQueue.pop();
        }
        var buf = Buffer.concat([new Int64(packet.DateTime).toBuffer(), new Buffer(27)]);
        buf.writeInt32BE(packet.Longitude, 8);
        buf.writeInt32BE(packet.Latitude, 12);
        buf.writeInt16BE(packet.Altitude, 16);
        buf.writeInt16BE(packet.Angle == '' ? -1 : packet.Angle, 18);
        buf.writeInt16BE(packet.Speed, 20);
        buf.writeInt8(packet.Satellites, 22);
        buf.writeFloatBE(packet.PDOP, 23);
        buf.writeFloatBE(packet.HDOP, 27);
        buf.writeFloatBE(packet.VDOP, 31);
        dataQueue.unshift(buf);
    }
    catch (error) {
        console.log(error);
    }
}, 1000);

var net = require('net');
var intervalSendToServer = setInterval(SendToServer, 10);
function SendToServer() {
    if (dataQueue.length == 0) return;
    clearInterval(intervalSendToServer);
    var client = net.connect({port: Port, host: Host}, function () {
        console.log('Tcp connected');
        client.on('data', function (data) {
            if (data.length == 1 && data[0] == 1) {
                var buf = dataQueue.pop();
                var result = client.write(buf);
                if (!result && dataQueue.length < MaxPackets) {
                    dataQueue.push(buf);
                }
            }
        });
        client.on('end', function () {
            console.log('Tcp disconnect');
            intervalSendToServer = setInterval(SendToServer, 10);
        });
        client.write(Imei);
    });
    client.on('error', function (error) {
        console.log('Tcp connect error: ');
        console.log(error);
        intervalSendToServer = setInterval(SendToServer, 10);
    });
}

//1433470474000
//3246364432
//$GPRMC,084120.00,A,5108.22102,N,07125.31107,E,0.026,,230415,,,D*75 // Минимально - рекомендованый набор данных
//$GPVTG,,T,,M,0.026,N,0.049,K,D*2F // Вектор движения и скорости
//$GPGGA,084120.00,5108.22102,N,07125.31107,E,2,11,0.84,388.0,M,-33.3,M,,0000*7B // Информация о фиксированном решении
//$GPGSA,A,3,09,07,16,23,27,30,10,19,20,05,28,,2.14,0.84,1.97*0C // Общая информация о спутниках
//$GPGSV,4,1,14,05,17,315,26,07,72,295,20,09,56,180,42,10,23,250,36*70 // Детальная информация о спутниках
//$GPGSV,4,2,14,16,30,053,23,19,35,121,30,20,20,296,27,21,03,021,20*7F
//$GPGSV,4,3,14,23,29,158,36,26,03,053,27,27,40,080,24,28,09,225,24*73
//$GPGSV,4,4,14,30,40,279,29,39,17,233,34*75
//$GPGLL,5108.22102,N,07125.31107,E,084120.00,A,D*69 // Данные широты и долготы