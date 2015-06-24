global.rootRequire = function(name){
    return require(__dirname + '/' + name);
}
var config = rootRequire('config.js');

var gps = rootRequire('gps/gps.js');
console.log('Started');