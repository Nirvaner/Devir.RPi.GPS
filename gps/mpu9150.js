/**
 * Created by Ivan on 21.05.2015.
 */
var spaceData = {
    gyro: {x: 0, y: 0, z: 0},
    accel: {x: 0, y: 0, z: 0},
    magneto: {x: 0, y: 0, z: 0}
};
exports.spaceData = spaceData;

var mpu9150 = require('mpu9150');
var mpu = new mpu9150();
mpu.initialize();

if (mpu.testConnection()) {
    var sensorsTimer = setInterval(function () {
        console.log('Heading: ' + mpu.getHeading().toString());
        //var dataArr = mpu.getMotion9();
        //spaceData.gyro.y = dataArr[0];
        //spaceData.gyro.x = dataArr[1];
        //spaceData.gyro.z = dataArr[2];
        //spaceData.accel.y = dataArr[3];
        //spaceData.accel.x = dataArr[4];
        //spaceData.accel.z = dataArr[5];
        //spaceData.magneto.y = dataArr[6];
        //spaceData.magneto.x = dataArr[7];
        //spaceData.magneto.z = dataArr[8];
        //console.log('GyroX: ' + spaceData.gyro.x);
        //console.log('GyroY: ' + spaceData.gyro.y);
        //console.log('GyroZ: ' + spaceData.gyro.z);
        //console.log('AccelX: ' + spaceData.accel.x);
        //console.log('AccelY: ' + spaceData.accel.y);
        //console.log('AccelZ: ' + spaceData.accel.z);
        //console.log('MagnetoX: ' + spaceData.magneto.x);
        //console.log('MagnetoY: ' + spaceData.magneto.y);
        //console.log('MagnetoZ: ' + spaceData.magneto.z);
    }, 200);
}