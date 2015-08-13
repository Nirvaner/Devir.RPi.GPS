var net = require('net');

var gps = rootRequire('gps/gps6mv2.js');
var space = rootRequire('gps/mpu9150.js');

var gpsQueue = [];

var angle = config.Angle / 2;
var lastMag = {x: 1, y: 1, z: 1};

var lastTime = new Date();
var lastCoor = {lat: 0, lon: 0};

setInterval(function () {
    try {
        var scal = lastMag.x * space.m.x + lastMag.y * space.m.y + lastMag.z * space.m.z;
        var lLength = Math.sqrt(lastMag.x * lastMag.x + lastMag.y * lastMag.y + lastMag.z * lastMag.z);
        var cLength = Math.sqrt(space.m.x * space.m.x + space.m.y * space.m.y + space.m.z * space.m.z);
        var a = Math.acos(scal / (lLength * cLength)) * 180 / Math.PI;
        //console.log('Angle: ', a);

        var curCoor = {lat: gps.latitude, lon: gps.longitude};
        var distance = DistanceTo(lastCoor, curCoor);
        //console.log('Distance: ', distance, lastCoor, curCoor);

        var time = (new Date() - lastTime) / 1000;
        //console.log('Time: ', time);

        if ((a > angle) || (distance > config.Distance) || (time > config.Time)) {
            lastMag.x = space.m.x;
            lastMag.y = space.m.y;
            lastMag.z = space.m.z;
            lastTime = new Date();
            lastCoor.lat = curCoor.lat;
            lastCoor.lon = curCoor.lon;
            if (gpsQueue.length > config.MaxPackets) {
                gpsQueue.pop();
            }
            var buf = new Buffer(48);
            buf.write(config.Imei);
            buf.writeInt8(gps.year, 15);
            buf.writeInt8(gps.month, 16);
            buf.writeInt8(gps.day, 17);
            buf.writeInt8(gps.hour, 18);
            buf.writeInt8(gps.minute, 19);
            buf.writeInt8(gps.second, 20);
            buf.writeFloatBE(gps.longitude, 21);
            buf.writeFloatBE(gps.latitude, 25);
            buf.writeInt16BE(gps.altitude, 29);
            buf.writeInt16BE(gps.angle, 31);
            buf.writeInt16BE(gps.speed, 33);
            buf.writeInt8(gps.satellites, 35);
            buf.writeFloatBE(gps.pdop, 36);
            buf.writeFloatBE(gps.hdop, 40);
            buf.writeFloatBE(gps.vdop, 44);
            gpsQueue.unshift(buf);
        }
    }
    catch (error) {
        console.log('ErrorGpsLogicInterval: ');
        console.log(error);
    }
}, 500);

var sendDelay = 0;

setInterval(function () {
    if (gpsQueue.length > 0) {
        var packet = gpsQueue.pop();
        var gpsPacketSocket = net.connect(config.GpsPacketSocket);
        gpsPacketSocket.on('connect', function () {
            gpsPacketSocket.write(packet, function () {
                gpsPacketSocket.destroy();
            });
            if (gpsQueue.length == 0) {
                sendDelay = 10000;
            } else {
                sendDelay = 0;
            }
        });
        gpsPacketSocket.on('error', function (error) {
            sendDelay = 1000;
            console.log('Devir > SendGpsQueue > GpsPacketSocket > Error: ', error);
        });
        gpsPacketSocket.on('close', function () {
            try {
                gpsPacketSocket.destroy();
            } catch (error) {
                console.log('Devir > SendGpsQueue > GpsPacketSocket > Destroy > Error: ', error);
            }
        });
    }
}, sendDelay);

// Helpers

function DistanceTo(coor1, coor2) {
    const Radius = 6372795; // –ассто€ние от центра земли до поверхности в метрах
    var lat1 = coor1.lat * Math.PI / 180;
    var lat2 = coor2.lat * Math.PI / 180;
    var lon1 = coor1.lon * Math.PI / 180;
    var lon2 = coor2.lon * Math.PI / 180;
    var pLat = Math.pow(Math.sin((lat2 - lat1) / 2), 2);
    var pLon = Math.pow(Math.sin((lon2 - lon1) / 2), 2);
    var result = 2 * Math.asin(Math.sqrt(pLat + Math.cos(lat1) * Math.cos(lat2) * pLon));
    result = result * Radius;
    return result;
}