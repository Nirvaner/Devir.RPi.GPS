var modem3g = rootRequire('modem3g.js');

var pingTimer;
var connections = [];
var connectCount = 0;

function Run() {
    try {
        if (connections.length == 0) {
            modem3g.reconnect(ConnectToServer);
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
        ServerSocket.write(config.Zander + '|' + config.Version + '||' + (siements ? '0' : '1'));
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
                }
                console.log('SocketServer > Run > Message: pingTimer is start');
                pingTimer = setTimeout(modem3g.reconnect(ConnectToServer), 120000);
            } catch (error) {
                console.log('SocketServer > Run > Error: ' + error);
            }
        });
    } catch (error) {
        console.log('SocketServer > Run > Error: ' + error);
        modem3g.reconnect(ConnectToServer);
    }
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
    try {
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
}

module.exports.Start = function () {
    modem3g.reconnect(ConnectToServer);
};