global.rootPath = __dirname + '/';
global.rootRequire = function (name) {
    return require(rootPath + name);
};

var net = require('net');

require('fs').readFile(rootPath + 'config.json', 'utf8', function (error, data) {
    if (error) {
        console.log('DevirReadConfigError: ', error);
        process.exit();
    }
    global.config = JSON.parse(data);
    rootRequire('SocketServer.js').Start();
});



// Helpers

function SysRestart() {
    try {
        spawn('sudo', ['-u', 'root', '-p', 'root', 'reboot'], {stdio: 'inherit'});
    } catch (error) {
        console.log('ErrorManageSysRestart: ' + error);
    }
}