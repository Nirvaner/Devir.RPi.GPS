var net = require('net');
var spawn = require('child_process').spawn;

var modem3g = rootRequire('modem3g.js');

var ServerSocket;

var pingTimer;
var connections = {
    get length() {
        return Object.keys(this).length - 3;
    },
    forEach: function(callback){
        var s = 0;
        for(var i in this){
            if (s > 2) {
                callback(this[i], i, this);
            }else{
                s++;
            }
        }
    },
    shift: function(){
        var res = this[Object.keys(this)[3]];
        delete this[Object.keys(this)[3]];
        return res;
    }
};
var connectCount = 0;

function Run() {
    setTimeout(function () {
        try {
            console.log("ServerSocket > Run > Message: connections.length = %d", connections.length);
            if (connections.length == 0) {
                console.log('ServerSocket > Run > Message: connections length is 0');
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
                console.log('SocketServer > Run > Message: connections destroy');
                connections.shift().destroy();
            }
            //console.log('SocketServer > Run > Message: pingTimer is start');
            pingTimer = setTimeout(function () {
                console.log('SocketServer > Run > Message: pingTimer90000 run');
                modem3g.reconnect(ConnectToServer);
            }, 90000);
            console.log('Run');
            ServerSocket.write(config.Imei + '|' + config.Version);
            console.log('ServerSocket > Run > Message: ServerSocket write done, watch serverSocket event "data"');
            ServerSocket.on('data', function (data) {
                try {
                    if (pingTimer) {
                        //console.log('SocketServer > Run > Message: pingTimer cleared');
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
                        GitPull();
                    } else {
                        console.log('unresolved data: ' + strData);
                    }
                    //console.log('SocketServer > Run > Message: pingTimer is start');
                    pingTimer = setTimeout(function () {
                        console.log('SocketServer > Run > Message: pingTimer120000 run');
                        modem3g.reconnect(ConnectToServer);
                    }, 120000);
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
            delete connections[config.Servers[index]];
            connectCount++;
            console.log('SocketServer > SocketClose > Message:', config.Servers[index]);
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
                connections[host] = socket;
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
    setTimeout(function () {
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