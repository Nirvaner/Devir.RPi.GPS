const Host = '192.168.66.100';
const Port = 11112;
const Imei = '000000000000000';
const MaxPackets = 10000; // Maximum packets count in memory
const MinPackets = 1; // Minimum packets count for send to server

const SerialPortGPS = '/dev/ttyAMA0';

var dataQueue = [];

var packet = {
    Year: 0,
    Month: 0,
    Day: 0,
    Hour: 0,
    Minute: 0,
    Second: 0,
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
            packet = JSON.parse(JSON.stringify(pack));
            pack.Year = nmeaArr[9].substring(4);
            pack.Month = nmeaArr[9].substring(2, 4);
            pack.Day = nmeaArr[9].substring(0, 2);
            pack.Hour = nmeaArr[1].substring(0, 2);
            pack.Minute = nmeaArr[1].substring(2, 4);
            pack.Second = nmeaArr[1].substring(4);
            pack.Speed = Math.round(nmeaArr[7] * 1.852);
            pack.Angle = nmeaArr[8];
        }
        else if (nmeaString.substring(3, 6) == 'GGA') {
            pack.Longitude = nmeaArr[4].replace('.', '') * 1;
            pack.Latitude = nmeaArr[2].replace('.', '') * 1;
            pack.Altitude = Math.round(nmeaArr[9]);
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
        console.log('DateTime: ' + new Date('20' + packet.Year, packet.Month - 1, packet.Day, packet.Hour, packet.Minute, packet.Second));
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
        var buf = new Buffer(33);
        buf.writeInt8(packet.Year);
        buf.writeInt8(packet.Month, 1);
        buf.writeInt8(packet.Day, 2);
        buf.writeInt8(packet.Hour, 3);
        buf.writeInt8(packet.Minute, 4);
        buf.writeInt8(packet.Second, 5);
        buf.writeInt32BE(packet.Longitude, 6);
        buf.writeInt32BE(packet.Latitude, 10);
        buf.writeInt16BE(Math.round(packet.Altitude), 14);
        buf.writeInt16BE(packet.Angle == '' ? -1 : packet.Angle, 16);
        buf.writeInt16BE(packet.Speed, 18);
        buf.writeInt8(packet.Satellites, 20);
        buf.writeFloatBE(packet.PDOP, 21);
        buf.writeFloatBE(packet.HDOP, 25);
        buf.writeFloatBE(packet.VDOP, 29);
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
//$GPRMC,084120.00,A,5108.22102,N,07125.31107,E,0.026,,230415,,,D*75 // ���������� - �������������� ����� ������
//$GPVTG,,T,,M,0.026,N,0.049,K,D*2F // ������ �������� � ��������
//$GPGGA,084120.00,5108.22102,N,07125.31107,E,2,11,0.84,388.0,M,-33.3,M,,0000*7B // ���������� � ������������� �������
//$GPGSA,A,3,09,07,16,23,27,30,10,19,20,05,28,,2.14,0.84,1.97*0C // ����� ���������� � ���������
//$GPGSV,4,1,14,05,17,315,26,07,72,295,20,09,56,180,42,10,23,250,36*70 // ��������� ���������� � ���������
//$GPGSV,4,2,14,16,30,053,23,19,35,121,30,20,20,296,27,21,03,021,20*7F
//$GPGSV,4,3,14,23,29,158,36,26,03,053,27,27,40,080,24,28,09,225,24*73
//$GPGSV,4,4,14,30,40,279,29,39,17,233,34*75
//$GPGLL,5108.22102,N,07125.31107,E,084120.00,A,D*69 // ������ ������ � �������