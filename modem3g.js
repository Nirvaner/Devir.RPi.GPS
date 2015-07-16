var spawn = require('child_process').spawn;
var fs = require('fs');
var gpio = require('gpio');
function pinSet(value) {
    return value; // value for transistor, ~ value for relay
}
var modemPin = gpio.export(config.ModemPin, {
    direction: 'out',
    ready: function () {
        modemPin.set(pinSet(1));
    }
});

var reconnectCallback;
var isError = false;

function ModemReboot() {
    try {
        console.log('ModemReboot');
        modemPin.set(0);
        setTimeout(function () {
            try {
                modemPin.set(1);
                setTimeout(function () {
                    try {
                        fs.exists(config.ModemDevicePath, function (exists) {
                            if (exists) {
                                SakisReconnect();
                            } else {
                                ModemReboot();
                            }
                        });
                    } catch (error) {
                        console.log('modem3g > ModemReboot > DeviceExists > Error: ' + error);
                    }
                }, 10000);
            } catch (error) {
                console.log('modem3g > ModemReboot > PinSet > Error: ' + error);
            }
        }, 1000);
    } catch (error) {
        console.log('modem3g > ModemReboot > Error: ' + error);
    }
}

function SakisReconnect() {
    try {
        spawn('sakis3g', ['reconnect'], {stdio: 'inherit'}).on('exit', function (code) {
            if (code == 0) {
                reconnectCallback();
            } else {
                setTimeout(function () {
                    Reconnect(); // Sakis not have connect
                }, 10000);
            }
        });
    } catch (error) {
        console.log('modem3g > SakisReconnect > Error: ' + error);
    }
}

function Reconnect(callback) {
    try {
        reconnectCallback = callback;
        console.log('ModemReconnect with: ' + isError);
        if (isError) {
            isError = false;
            ModemReboot();
        } else {
            isError = true;
            SakisReconnect();
        }
    } catch (error) {
        console.log('modem3g > Reconnect > Error: ' + error);
    }
}

module.exports = {
    reconnect: Reconnect
};