var config = rootRequire('config.js');
var gps = rootRequire('gps/gps6mv2.js');
var space = rootRequire('gps/mpu9150.js');

var dataQueue = [];

var s = '           ';

setInterval(function () {
    try {
        process.stdout.write('gx: ' + space.g.x + s.substring(0, 10 - space.g.x.toString().length));
        process.stdout.write('gy: ' + space.g.y + s.substring(0, 10 - space.g.y.toString().length));
        process.stdout.write('gz: ' + space.g.z + s.substring(0, 10 - space.g.z.toString().length));
        var gLength = Math.sqrt(space.g.x * space.g.x + space.g.y * space.g.y + space.g.z * space.g.z);
        var gxAngle = Math.round(Math.acos(space.g.x / gLength) * 180 / Math.PI);
        var gyAngle = Math.round(Math.acos(space.g.y / gLength) * 180 / Math.PI);
        var gzAngle = Math.round(Math.acos(space.g.z / gLength) * 180 / Math.PI);
        process.stdout.write('agx: ' + gxAngle + s.substring(0, 10 - gxAngle.toString().length));
        process.stdout.write('agy: ' + gyAngle + s.substring(0, 10 - gyAngle.toString().length));
        process.stdout.write('agz: ' + gzAngle + s.substring(0, 10 - gzAngle.toString().length));

        process.stdout.write('mx: ' + space.m.x + s.substring(0, 10 - space.m.x.toString().length));
        process.stdout.write('my: ' + space.m.y + s.substring(0, 10 - space.m.y.toString().length));
        process.stdout.write('mz: ' + space.m.z + s.substring(0, 10 - space.m.z.toString().length));
        var mLength = Math.sqrt(space.m.x * space.m.x + space.m.y * space.m.y + space.m.z * space.m.z);
        var mxAngle = Math.round(Math.acos(space.m.x / mLength) * 180 / Math.PI);
        var myAngle = Math.round(Math.acos(space.m.y / mLength) * 180 / Math.PI);
        var mzAngle = Math.round(Math.acos(space.m.z / mLength) * 180 / Math.PI);
        process.stdout.write('amx: ' + mxAngle + s.substring(0, 10 - mxAngle.toString().length));
        process.stdout.write('amy: ' + myAngle + s.substring(0, 10 - myAngle.toString().length));
        process.stdout.write('amz: ' + mzAngle + s.substring(0, 10 - mzAngle.toString().length));

        //var scalGM = space.g.x * space.m.x + space.g.y * space.m.y + space.g.z * space.m.z;
        //var angleGM = Math.round(Math.acos(scalGM / (gLength * mLength)) * 180 / Math.PI);
        //var angleMGorizont = angleGM - 90;

        //process.stdout('angle: ' + angleGM + s.substring(0, 10 - angleGM.toString().length));

        console.log('');
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