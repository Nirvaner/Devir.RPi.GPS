var config = rootRequire('config.js');
var gpsData = rootRequire('gps/gps6mv2.js');
var spaceData = rootRequire('gps/mpu9150.js');

var dataQueue = [];

var s = '                                             ';

setInterval(function () {
    try {
        process.stdout.write('ax: ' + spaceData.a.x + s.substring(0, 10 - spaceData.a.x.toString().length));
        process.stdout.write('ay: ' + spaceData.a.y + s.substring(0, 10 - spaceData.a.y.toString().length));
        process.stdout.write('az: ' + spaceData.a.z + s.substring(0, 10 - spaceData.a.z.toString().length));
        process.stdout.write('gx: ' + spaceData.g.x + s.substring(0, 10 - spaceData.g.x.toString().length));
        process.stdout.write('gy: ' + spaceData.g.y + s.substring(0, 10 - spaceData.g.y.toString().length));
        process.stdout.write('gz: ' + spaceData.g.z + s.substring(0, 10 - spaceData.g.z.toString().length));
        process.stdout.write('mx: ' + spaceData.m.x + s.substring(0, 10 - spaceData.m.x.toString().length));
        process.stdout.write('my: ' + spaceData.m.y + s.substring(0, 10 - spaceData.m.y.toString().length));
        process.stdout.writeln('mz: ' + spaceData.m.z + s.substring(0, 10 - spaceData.m.z.toString().length));
        if (dataQueue.length > config.MaxPackets) {
            dataQueue.pop();
        }
        var buf = new Buffer(33);
        buf.writeInt8(gpsData.year, 0);
        buf.writeInt8(gpsData.month, 1);
        buf.writeInt8(gpsData.day, 2);
        buf.writeInt8(gpsData.hour, 3);
        buf.writeInt8(gpsData.minute, 4);
        buf.writeInt8(gpsData.second, 5);
        buf.writeInt32BE(gpsData.longitude, 6);
        buf.writeInt32BE(gpsData.latitude, 10);
        buf.writeInt16BE(gpsData.altitude, 14);
        buf.writeInt16BE(gpsData.angle, 16);
        buf.writeInt16BE(gpsData.speed, 18);
        buf.writeInt8(gpsData.satellites, 20);
        buf.writeFloatBE(gpsData.pdop, 21);
        buf.writeFloatBE(gpsData.hdop, 25);
        buf.writeFloatBE(gpsData.vdop, 29);
        //dataQueue.unshift(buf);
    }
    catch (error) {
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