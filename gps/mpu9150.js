/**
 * Created by Ivan on 21.05.2015.
 */
var spaceData = {
    g: {x: 0, y: 0, z: 0},
    a: {x: 0, y: 0, z: 0},
    m: {x: 0, y: 0, z: 0}
};
module.exports = spaceData;

var mpu9150 = require('mpu9150');
var mpu = new mpu9150();
mpu.initialize();

if (mpu.testConnection()) {
    var sensorsTimer = setInterval(function () {
        console.log('Heading: ' + mpu.getHeading().toString());
        var dataArr = mpu.getMotion9();
        spaceData.g.y = dataArr[0];
        spaceData.g.x = dataArr[1];
        spaceData.g.z = dataArr[2];
        spaceData.a.y = dataArr[3];
        spaceData.a.x = dataArr[4];
        spaceData.a.z = dataArr[5];
        spaceData.m.y = dataArr[6];
        spaceData.m.x = dataArr[7];
        spaceData.m.z = dataArr[8];
        console.log('GX: ' + spaceData.g.x);
        console.log('GY: ' + spaceData.g.y);
        console.log('GZ: ' + spaceData.g.z);
        console.log('AX: ' + spaceData.a.x);
        console.log('AY: ' + spaceData.a.y);
        console.log('AZ: ' + spaceData.a.z);
        console.log('MX: ' + spaceData.m.x);
        console.log('MY: ' + spaceData.m.y);
        console.log('MZ: ' + spaceData.m.z);
    });
}