/**
 * Created by Ivan on 21.05.2015.
 */
const SerialPortGPS = '/dev/ttyAMA0';

var packet = {
    year: 0,
    month: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
    longitude: 0,
    latitude: 0,
    altitude: 0,
    angle: 0,
    speed: 0,
    satellites: 0,
    pdop: 0,
    hdop: 0,
    vdop: 0
};
exports.gpsData = packet;

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
            pack.year = nmeaArr[9].substring(4);
            pack.month = nmeaArr[9].substring(2, 4);
            pack.day = nmeaArr[9].substring(0, 2);
            pack.hour = nmeaArr[1].substring(0, 2);
            pack.minute = nmeaArr[1].substring(2, 4);
            pack.second = nmeaArr[1].substring(4);
            pack.speed = Math.round(nmeaArr[7] * 1.852);
            pack.angle = nmeaArr[8] == '' ? pack.angle : nmeaArr[8];
        }
        else if (nmeaString.substring(3, 6) == 'GGA') {
            pack.longitude = nmeaArr[4].replace('.', '') * 1;
            pack.latitude = nmeaArr[2].replace('.', '') * 1;
            pack.altitude = Math.round(nmeaArr[9]);
            pack.satellites = nmeaArr[7];
        }
        else if (nmeaString.substring(3, 6) == 'GSA') {
            pack.pdop = nmeaArr[15] * 1;
            pack.hdop = nmeaArr[16] * 1;
            pack.vdop = nmeaArr[17].split('*')[0] * 1;
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

//1433470474000
//3246364432
//$GPRMC,084120.00,A,5108.22102,N,07125.31107,E,0.026,,230415,,,D*75 // ?????????? - ?????????????? ????? ??????
//$GPVTG,,T,,M,0.026,N,0.049,K,D*2F // ?????? ???????? ? ????????
//$GPGGA,084120.00,5108.22102,N,07125.31107,E,2,11,0.84,388.0,M,-33.3,M,,0000*7B // ?????????? ? ????????????? ???????
//$GPGSA,A,3,09,07,16,23,27,30,10,19,20,05,28,,2.14,0.84,1.97*0C // ????? ?????????? ? ?????????
//$GPGSV,4,1,14,05,17,315,26,07,72,295,20,09,56,180,42,10,23,250,36*70 // ????????? ?????????? ? ?????????
//$GPGSV,4,2,14,16,30,053,23,19,35,121,30,20,20,296,27,21,03,021,20*7F
//$GPGSV,4,3,14,23,29,158,36,26,03,053,27,27,40,080,24,28,09,225,24*73
//$GPGSV,4,4,14,30,40,279,29,39,17,233,34*75
//$GPGLL,5108.22102,N,07125.31107,E,084120.00,A,D*69 // ?????? ?????? ? ???????