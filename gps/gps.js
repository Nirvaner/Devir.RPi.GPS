var config = rootRequire('config.js');
var gps = rootRequire('gps/gps6mv2.js');
var space = rootRequire('gps/mpu9150.js');

var dataQueue = [];

var s = '           ';

setInterval(function () {
    try {
        var scal = space.g.x * space.m.x + space.g.y * space.m.y + space.g.z * space.m.z;
        var gLength = Math.sqrt(space.g.x * space.g.x + space.g.y * space.g.y + space.g.z * space.g.z);
        var mLength = Math.sqrt(space.m.x * space.m.x + space.m.y * space.m.y + space.m.z * space.m.z);

        var angle = Math.acos(scal/(gLength * mLength)) * 180 / Math.PI - 90;

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