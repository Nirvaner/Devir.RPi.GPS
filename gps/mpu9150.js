var _ = require('underscore')._;
var spaceData = {
    g: {x: 0, y: 0, z: 0},
    a: {x: 0, y: 0, z: 0},
    m: {x: 0, y: 0, z: 0}
};
var mpu9150 = require('mpu9150');
var mpu = new mpu9150();
mpu.initialize();

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
        data.g.x = dataArr[0];
        data.g.y = dataArr[1];
        data.g.z = dataArr[2];
        data.a.x = dataArr[3];
        data.a.y = dataArr[4];
        data.a.z = dataArr[5];
        data.m.x = dataArr[7];
        data.m.y = dataArr[6];
        data.m.z = dataArr[8];
        _.extend(spaceData, data);
    });
}
module.exports = spaceData;