var config = rootRequire('config.js');
var gps = rootRequire('gps/gps6mv2.js');
var space = rootRequire('gps/mpu9150.js');

var dataQueue = [];

//var s = '           ';

setInterval(function () {
    try {
        var gxProjectionLength = Math.sqrt(space.g.y * space.g.y + space.g.z * space.g.z);
        var gyzProjectionAngle = Math.acos(space.g.y / gxProjectionLength);
        space.g.y = space.g.y * Math.cos(gyzProjectionAngle) - space.g.z * Math.sin(gyzProjectionAngle);
        space.g.z = space.g.y * Math.sin(gyzProjectionAngle) + space.g.z * Math.cos(gyzProjectionAngle);
        var mxProjectionLength = Math.sqrt(space.m.y * space.m.y + space.m.z * space.m.z);
        var myzProjectionAngle = Math.acos(space.m.y / mxProjectionLength);
        space.m.y = space.m.y * Math.cos(myzProjectionAngle) - space.m.z * Math.sin(myzProjectionAngle);
        space.m.z = space.m.y * Math.sin(myzProjectionAngle) + space.m.z * Math.cos(myzProjectionAngle);

        var gzProjectionLength = Math.sqrt(space.g.y * space.g.y + space.g.x + space.g.x);
        var gyxProjectionAngle = Math.acos(space.g.y / gzProjectionLength);
        space.g.x = space.g.x * Math.cos(gyxProjectionAngle) - space.g.y * Math.sin(gyxProjectionAngle);
        space.g.y = space.g.x * Math.sin(gyxProjectionAngle) + space.g.y * Math.cos(gyxProjectionAngle);
        var mzProjectionLength = Math.sqrt(space.m.y * space.m.y + space.m.x + space.m.x);
        var myxProjectionAngle = Math.acos(space.m.y / mzProjectionLength);
        space.m.x = space.m.x * Math.cos(myxProjectionAngle) - space.m.y * Math.sin(myxProjectionAngle);
        space.m.y = space.m.x * Math.sin(myxProjectionAngle) + space.m.y * Math.cos(myxProjectionAngle);

        var ProjectionLength = Math.sqrt(space.m.x * space.m.x + space.m.z + space.m.z);
        var ProjectionAngle = Math.acos(space.m.x / ProjectionLength) * 180 / Math.PI;

        console.log(ProjectionAngle);

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
}, 1);

//var net = require('net');
//var intervalSendToServer = setInterval(SendToServer, 100000);
//function SendToServer() {
//    if (dataQueue.length == 0) return;
//    clearInterval(intervalSendToServer);
//    var client = net.connect({host: settings.host, port: settings.port}, function () {
//        console.log('Tcp connected');
//        client.on('data', function (data) {
//            if (data.length == 1 && data[0] == 1) {
//                var buf = dataQueue.pop();
//                var result = client.write(buf);
//                if (!result && dataQueue.length < settings.MaxPackets) {
//                    dataQueue.push(buf);
//                }
//            }
//        });
//        client.on('end', function () {
//            console.log('Tcp disconnect');
//            intervalSendToServer = setInterval(SendToServer, 10);
//        });
//        client.write(Imei);
//    });
//    client.on('error', function (error) {
//        console.log('Tcp connect error: ');
//        console.log(error);
//        intervalSendToServer = setInterval(SendToServer, 10);
//    });
//}