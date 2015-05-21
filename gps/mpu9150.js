/**
 * Created by Ivan on 21.05.2015.
 */
var spaceData = {
    gyro: {x: 0, y: 0, z: 0},
    accel: {x: 0, y: 0, z: 0},
    magneto: {x: 0, y: 0, z: 0}
};
exports.spaceData = spaceData;

var exec = require('child_process').exec;

var sensorsTimer = setTimeout(function(){
    exec('i2cdump -y 0x1 0x68 c',
        {
            encoding: 'utf8',
            timeout: 10,
            maxBuffer: 200*1024,
            killSignal: 'SIGTERM',
            cwd: null,
            env: null
        },
        function(error, stdout, stderr){
            console.log(stdout);
            console.log('stderr: ' + stderr);
            if (error !== null){
                console.log('exec error: ' + error);
            }
        });
}, 1000);