var net = require('net');

var modem3g = rootRequire('modem3g.js');

var ServerSocket;

var pingTimer;
var connections = [];
var connectCount = 0;

function Run() {
    setTimeout(function () {
        try {
            if (connections.length == 0) {
                modem3g.reconnect(ConnectToServer);
                return;
            }
            connections.forEach(function (socket) {
                socket.on('close', function () {
                    connectCount = 0;
                });
            });
            ServerSocket = connections.shift();
            for (var i = 0; i < connections.length; i++) {
                connections.shift().destroy();
            }
            console.log('SocketServer > Run > Message: pingTimer is start');
            pingTimer = setTimeout(modem3g.reconnect(ConnectToServer), 90000);
            console.log('Run');
            ServerSocket.write(config.Imei + '|' + config.Version);
            ServerSocket.on('data', function (data) {
                try {
                    if (pingTimer) {
                        console.log('SocketServer > Run > Message: pingTimer cleared');
                        clearTimeout(pingTimer);
                    }
                    var strData = data.toString();
                    if (strData[0] == '0') {
                        console.log('ping');
                        ServerSocket.write('0');
                    } else if (strData.substring(0, 6) == 'reboot') {
                        console.log('reboot');
                        ServerSocket.write('0');
                        SysRestart();
                    } else if (strData.substring(0, 8) == 'datetime') {
                        console.log('datetime');
                        spawn('sudo', ['-u', 'root', '-p', 'root', 'date', '-s', strData.substring(8)], {stdio: 'inherit'});
                        ServerSocket.write('0');
                    } else if (strData.substring(0, 8) == 'settings') {

                    } else if (strData.substring(0, 7) == 'gitpull') {
                        if (skd) {
                            spawn('sudo', ['-u', 'root', '-p', 'root', 'kill', skd.pid], {stdio: 'inherit'});
                        }
                        if (siements) {
                            siements.on('exit', function () {
                                GitPull();
                            });
                            spawn('sudo', ['-u', 'root', '-p', 'root', 'kill', siements.pid], {stdio: 'inherit'});
                        } else {
                            GitPull();
                        }
                    } else {
                        console.log('unresolved data: ' + strData);
                    }
                    console.log('SocketServer > Run > Message: pingTimer is start');
                    pingTimer = setTimeout(modem3g.reconnect(ConnectToServer), 120000);
                } catch (error) {
                    console.log('SocketServer > Run > ServerSocketEventData > Error: ' + error);
                }
            });
        } catch (error) {
            console.log('SocketServer > Run > Error: ' + error);
            modem3g.reconnect(ConnectToServer);
        }
    });
}

function SocketError(error) {
    console.log('SocketServer > SocketError > Error: ', error);
}
function SocketClose(index) {
    return function () {
        try {
            connections.splice(index, 1);
            connectCount++;
            console.log('Close in socketToServer');
            if (connectCount == config.Servers.length) {
                Run();
            }
        } catch (error) {
            console.log('SocketServer > SocketClose > Error: ' + error);
        }
    }
}
function SocketConnect(obj) {
    return function () {
        try {
            clearTimeout(obj.timer);
            connectCount++;
            console.log('SocketServer > SocketConnect > ConnectToServer: ', obj.index, config.Servers[obj.index]);
            if (connectCount == config.Servers.length) {
                Run();
            }
        } catch (error) {
            console.log('SocketServer > SocketConnect > Error: ' + error);
        }
    }
}

function ConnectToServer() {
    setTimeout(function () {
        try {
            connectCount = 0;
            config.Servers.forEach(function (host, index) {
                var socket = net.connect({host: host, port: config.Port});
                var timer = setTimeout(function () {
                    socket.destroy();
                }, config.ServerTimeout);
                socket.on('error', SocketError);
                socket.on('close', SocketClose(index));
                socket.on('connect', SocketConnect({
                    index: index
                    , timer: timer
                }));
                connections.push(socket);
            });
        } catch (error) {
            console.log('SocketServer > ConnectToServer > Error: ' + error);
        }
    });
}

module.exports.Start = function () {
    modem3g.reconnect(ConnectToServer);
};

// Helpers

function GitPull() {
    setTimeout(function() {
        try {
            ServerSocket.write('0');
            ServerSocket.end();
            spawn('bash', [rootPath + '../gitpull.sh'], {stdio: 'inherit'});
            process.exit(0);
        } catch (error) {
            console.log('ErrorManageGitPull: ' + error);
        }
    });
}

function SysRestart() {
    try {
        spawn('sudo', ['-u', 'root', '-p', 'root', 'reboot'], {stdio: 'inherit'});
    } catch (error) {
        console.log('Devir > SysRestart > Error: ' + error);
    }
}