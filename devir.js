global.rootPath = __dirname + '/';
global.rootRequire = function (name) {
    return require(rootPath + name);
};

var net = require('net');

require('fs').readFile(rootPath + 'config.json', 'utf8', function (error, data) {
    if (error) {
        console.log('Devir > ReadConfig > Error: ', error);
        process.exit();
    }
    global.config = JSON.parse(data);
    console.log('Devir > fs > Message: SocketServer.Start()');
    rootRequire('SocketServer.js').Start();
    rootRequire('gps/gps.js');
});



// Helpers