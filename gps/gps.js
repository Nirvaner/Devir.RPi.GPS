var gps = rootRequire('gps/gps6mv2.js');
var space = rootRequire('gps/mpu9150.js');

var dataQueue = [];

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
        console.log('Angle: ', a);

        var distance = DistanceTo(lastCoor, gps);

        var time = (new Date() - lastTime)/1000;
        console.log(time);

        if ((a > angle) || (distance > config.Distance) || (time > config.Time)) {
            lastMag.x = space.m.x;
            lastMag.y = space.m.y;
            lastMag.z = space.m.z;
            console.log('Logic packet');
        }
        if (dataQueue.length > config.MaxPackets) {
            dataQueue.pop();
        }
        var buf = new Buffer(33);
        buf.writeInt8(gps.year, 0);
        buf.writeInt8(gps.month, 1);
        buf.writeInt8(gps.day, 2);
        buf.writeInt8(gps.hour, 3);
        buf.writeInt8(gps.minute, 4);
        buf.writeInt8(gps.second, 5);
        buf.writeInt32BE(gps.longitude, 6);
        buf.writeInt32BE(gps.latitude, 10);
        buf.writeInt16BE(gps.altitude, 14);
        buf.writeInt16BE(gps.angle, 16);
        buf.writeInt16BE(gps.speed, 18);
        buf.writeInt8(gps.satellites, 20);
        buf.writeFloatBE(gps.pdop, 21);
        buf.writeFloatBE(gps.hdop, 25);
        buf.writeFloatBE(gps.vdop, 29);
        //dataQueue.unshift(buf);
    }
    catch (error) {
        console.log('ErrorGpsLogicInterval: ');
        console.log(error);
    }
}, 500);

module.exports = dataQueue;

function DistanceTo(coor1, coor2) {
    const Radius = 6372795; // –ассто€ние от центра земли до поверхности в метрах
    var lat1 = coor1.lat * Math.PI / 180;
    var lat2 = coor2.lat * Math.PI / 180;
    var lon1 = coor1.lon * Math.PI / 180;
    var lon2 = coor2.lon * Math.PI / 180;
    var pLat = Math.pow(Math.Sin((lat2 - lat1) / 2), 2);
    var pLon = Math.pow(Math.Sin((lon2 - lon1) / 2), 2);
    var result = 2 * Math.asin(Math.sqrt(pLat + Math.cos(lat1) * Math.cos(lat2) * pLon));
    return result * Radius;
}