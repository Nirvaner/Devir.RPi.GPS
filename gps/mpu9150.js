var _ = require('underscore')._;
var spaceData = {
    g: {x: 0, y: 0, z: 0},
    a: {x: 0, y: 0, z: 0},
    m: {x: 0, y: 0, z: 0, m: 0}
};
var mpu9150 = require('mpu9150');
var mpu = new mpu9150();
mpu.initialize();

const MaxGyro = 16384;
const  N = 256;

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
        data.g.x = Math.round(dataArr[0] * 90 / MaxGyro);
        data.g.y = Math.round(dataArr[1] * 90 / MaxGyro);
        data.g.z = Math.round(dataArr[2] * 90 / MaxGyro);
        data.a.x = dataArr[3];
        data.a.y = dataArr[4];
        data.a.z = dataArr[5];
        var mx = dataArr[7];
        var my = dataArr[6];
        var mz = dataArr[8] * (-1);

        data.m.m = mx*mx/N + my*my/N + mz*mz/N;
        data.m.x = mx;
        data.m.y = my;
        data.m.z = mz;
        _.extend(spaceData, data);
    });
}
module.exports = spaceData;