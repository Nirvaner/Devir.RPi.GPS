var config = rootRequire('config.js');
var gps = rootRequire('gps/gps6mv2.js');
var space = rootRequire('gps/mpu9150.js');

var dataQueue = [];

var s = '           ';

setInterval(function () {
    try {
        var gyzProjectionLength = Math.sqrt(space.g.y * space.g.y + space.g.z * space.g.z);
        console.log(gyzProjectionLength);
        var gyzProjectionYAngle = Math.acos(space.g.y / gyzProjectionLength);
        console.log(gyzProjectionYAngle);
        space.g.y = space.g.y * Math.cos(gyzProjectionYAngle) - space.g.z * Math.sin(gyzProjectionYAngle);
        space.g.z = space.g.y * Math.sin(gyzProjectionYAngle) + space.g.z * Math.cos(gyzProjectionYAngle);

        var myzProjectionLength = Math.sqrt(space.m.y * space.m.y + space.m.z * space.m.z);
        console.log(myzProjectionLength);
        var myzProjectionYAngle = Math.acos(space.m.y / myzProjectionLength);
        console.log(myzProjectionYAngle);
        space.m.y = space.m.y * Math.cos(myzProjectionYAngle) - space.m.z * Math.sin(myzProjectionYAngle);
        space.m.z = space.m.y * Math.sin(myzProjectionYAngle) + space.m.z * Math.cos(myzProjectionYAngle);


        var gyxProjectionLength = Math.sqrt(space.g.y * space.g.y + space.g.x + space.g.x);
        console.log(gyxProjectionLength);
        var gyxProjectionYAngle = Math.acos(space.g.y / gyxProjectionLength);
        console.log(gyxProjectionYAngle);
        space.g.x = space.g.x * Math.cos(gyxProjectionYAngle) - space.g.y * Math.sin(gyxProjectionYAngle);
        space.g.y = space.g.x * Math.sin(gyxProjectionYAngle) + space.g.y * Math.cos(gyxProjectionYAngle);

        var myxProjectionLength = Math.sqrt(space.m.y * space.m.y + space.m.x + space.m.x);
        console.log(myxProjectionLength);
        var myxProjectionYAngle = Math.acos(space.m.y / myxProjectionLength);
        console.log(myxProjectionYAngle);
        space.m.x = space.m.x * Math.cos(myxProjectionYAngle) - space.m.y * Math.sin(myxProjectionYAngle);
        space.m.y = space.m.x * Math.sin(myxProjectionYAngle) + space.m.y * Math.cos(myxProjectionYAngle);

        var ProjectionLength = Math.sqrt(space.m.x * space.m.x + space.m.z + space.m.z);
        var ProjectionAngle = Math.acos(space.m.x / ProjectionLength) * 180 / Math.PI;

        console.log(ProjectionLength);

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
}, 10000);

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