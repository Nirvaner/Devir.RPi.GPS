var settings = require('./../settings.js').settings;
var gpsData = require('./gps6mv2.js').packet;
//var spaseData = require('./mpu9150.js').spaseData;

var dataQueue = [];

var LogicInterval = setInterval(function () {
    try {
        console.log('DateTime: ' + new Date('20' + gpsData.Year, gpsData.Month - 1, gpsData.Day, gpsData.Hour, gpsData.Minute, gpsData.Second));
        console.log('Latitude: ' + gpsData.Latitude);
        console.log('Longitude: ' + gpsData.Longitude);
        console.log('Altitude: ' + gpsData.Altitude);
        console.log('Angle: ' + gpsData.Angle);
        console.log('Speed: ' + gpsData.Speed);
        console.log('Satellites: ' + gpsData.Satellites);
        console.log('PDOP: ' + gpsData.PDOP);
        console.log('HDOP: ' + gpsData.HDOP);
        console.log('VDOP: ' + gpsData.VDOP);
        //if (dataQueue.length > MaxPackets) {
        //    dataQueue.pop();
        //}
        //var buf = new Buffer(33);
        //buf.writeInt8(packet.Year, 0);
        //buf.writeInt8(packet.Month, 1);
        //buf.writeInt8(packet.Day, 2);
        //buf.writeInt8(packet.Hour, 3);
        //buf.writeInt8(packet.Minute, 4);
        //buf.writeInt8(packet.Second, 5);
        //buf.writeInt32BE(packet.Longitude, 6);
        //buf.writeInt32BE(packet.Latitude, 10);
        //buf.writeInt16BE(packet.Altitude, 14);
        //buf.writeInt16BE(packet.Angle, 16);
        //buf.writeInt16BE(packet.Speed, 18);
        //buf.writeInt8(packet.Satellites, 20);
        //buf.writeFloatBE(packet.PDOP, 21);
        //buf.writeFloatBE(packet.HDOP, 25);
        //buf.writeFloatBE(packet.VDOP, 29);
        //dataQueue.unshift(buf);
    }
    catch (error) {
        console.log(error);
    }
}, 1000);

var net = require('net');
var intervalSendToServer = setInterval(SendToServer, 100000);
function SendToServer() {
    if (dataQueue.length == 0) return;
    clearInterval(intervalSendToServer);
    var client = net.connect({host: settings.Host, port: settings.Port}, function () {
        console.log('Tcp connected');
        client.on('data', function (data) {
            if (data.length == 1 && data[0] == 1) {
                var buf = dataQueue.pop();
                var result = client.write(buf);
                if (!result && dataQueue.length < settings.MaxPackets) {
                    dataQueue.push(buf);
                }
            }
        });
        client.on('end', function () {
            console.log('Tcp disconnect');
            intervalSendToServer = setInterval(SendToServer, 10);
        });
        client.write(Imei);
    });
    client.on('error', function (error) {
        console.log('Tcp connect error: ');
        console.log(error);
        intervalSendToServer = setInterval(SendToServer, 10);
    });
}