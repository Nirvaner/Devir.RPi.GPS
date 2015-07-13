var gps = rootRequire('gps/gps6mv2.js');
var space = rootRequire('gps/mpu9150.js');

var dataQueue = [];

setInterval(function () {
    try {
        var scal = space.g.x * space.m.x + space.g.y * space.m.y + space.g.z * space.m.z;
        var gLength = Math.sqrt(space.g.x * space.g.x + space.g.y * space.g.y + space.g.z * space.g.z);
        var mLength = Math.sqrt(space.m.x * space.m.x + space.m.y * space.m.y + space.m.z * space.m.z);

        var angle = Math.acos(scal/(gLength * mLength)) * 180 / Math.PI - 90;
        angle = config.angle / 90 * (90 - angle);

        console.log(angle);

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
}, 1000);

module.exports = dataQueue;