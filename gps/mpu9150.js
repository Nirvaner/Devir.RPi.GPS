var _ = require('underscore')._;
var spaceData = {
    g: {x: 0, y: 0, z: 0},
    a: {x: 0, y: 0, z: 0},
    m: {x: 0, y: 0, z: 0}
};
var mpu9150 = require('mpu9150');
var mpu = new mpu9150();
mpu.initialize();

const MaxGyro = 16384;

var data = {};
data = _.extend(data, spaceData);
if (mpu.testConnection()) {
    setInterval(function () {
        try {
            var dataArr = mpu.getMotion9();
        }catch(error){
            console.log('ErrorMPURead:');
            console.log(error);
        }
        data.g.y = Math.round(dataArr[0] / (MaxGyro / 360));
        data.g.x = Math.round(dataArr[1] / (MaxGyro / 360));
        data.g.z = Math.round(dataArr[2] / (MaxGyro / 360));
        data.a.y = dataArr[3];
        data.a.x = dataArr[4];
        data.a.z = dataArr[5];
        data.m.y = dataArr[6];
        data.m.x = dataArr[7];
        data.m.z = dataArr[8];
        _.extend(spaceData, data);
    });
}
module.exports = spaceData;