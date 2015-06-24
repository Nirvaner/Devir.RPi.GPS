var config = rootRequire('config.js');
//var gpsData = rootRequire('gps/gps6mv2.js');
var spaceData = rootRequire('gps/mpu9150.js');
//
//var dataQueue = [];
//
//var LogicInterval = setInterval(function () {
//    try {
//        //console.log('DateTime: ' + new Date('20' + gpsData.year, gpsData.month - 1, gpsData.day, gpsData.hour, gpsData.minute, gpsData.second));
//        //console.log('Latitude: ' + gpsData.latitude);
//        //console.log('Longitude: ' + gpsData.longitude);
//        //console.log('Altitude: ' + gpsData.altitude);
//        //console.log('Angle: ' + gpsData.angle);
//        //console.log('Speed: ' + gpsData.speed);
//        //console.log('Satellites: ' + gpsData.satellites);
//        //console.log('PDOP: ' + gpsData.pdop);
//        //console.log('HDOP: ' + gpsData.hdop);
//        //console.log('VDOP: ' + gpsData.vdop);
//        if (dataQueue.length > settings.MaxPackets) {
//            dataQueue.pop();
//        }
//        var buf = new Buffer(33);
//        buf.writeInt8(gpsData.year, 0);
//        buf.writeInt8(gpsData.month, 1);
//        buf.writeInt8(gpsData.day, 2);
//        buf.writeInt8(gpsData.hour, 3);
//        buf.writeInt8(gpsData.minute, 4);
//        buf.writeInt8(gpsData.second, 5);
//        buf.writeInt32BE(gpsData.longitude, 6);
//        buf.writeInt32BE(gpsData.latitude, 10);
//        buf.writeInt16BE(gpsData.altitude, 14);
//        buf.writeInt16BE(gpsData.angle, 16);
//        buf.writeInt16BE(gpsData.speed, 18);
//        buf.writeInt8(gpsData.satellites, 20);
//        buf.writeFloatBE(gpsData.pdop, 21);
//        buf.writeFloatBE(gpsData.hdop, 25);
//        buf.writeFloatBE(gpsData.vdop, 29);
//        //dataQueue.unshift(buf);
//    }
//    catch (error) {
//        console.log(error);
//    }
//}, 1000);
//
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