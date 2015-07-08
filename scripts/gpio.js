#!/usr/local/bin/node
global.RootPath = __dirname + '/';
global.RootRequire = function(name){
    return require(RootPath + name);
};

var gpio = require('gpio');
if (process.argv.length < 2){
    console.log('Two parameters: <gpioPin> <operation(on or off)>');
    process.exit(0);
}
try {
    var pinNumber = process.argv[0] * 1;
}catch(error){
    console.log('First argument on command line = UInt8, error: ' + error);
}
var operation = process.argv[1];
var pin = gpio.export(pinNumber, {
    direction: 'out'
    , ready: function(){
        if (operation == 'on') {
            pin.set(1);
        }else{
            pin.set(0);
        }
    }
});