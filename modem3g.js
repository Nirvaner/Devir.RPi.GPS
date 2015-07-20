const usbPath = '/sys/bus/usb/drivers/usb/';

var spawn = require('child_process').spawn;
var fs = require('fs');
var gpio = require('gpio');
function ModemPinSet(value) {
    modemPin.set(value); // value for transistor, ~ value for relay
}
var modemPin = gpio.export(config.Modem.Pin, {
    direction: 'out',
    ready: function () {
        ModemPinSet(1);
    }
});

var reconnectCallback;
var isError = false;

function ModemReboot() {
    setTimeout(function() {
        try {
            console.log('ModemReboot');
            var dirs = fs.readdirSync(usbPath).filter(function (file) {
                return fs.statSync(usbPath + file).isDirectory();
            });
            console.log('modem3g > ModemReboot > Dirs:', dirs);
            dirs.forEach(function (dir) {
                if (fs.existsSync(usbPath + dir + '/idVendor') && fs.readFileSync(usbPath + dir + '/idVendor') == config.Modem.Vendor) {
                    fs.appendFileSync(usbPath + 'unbind', dir);
                }
            });
            setTimeout(function () {
                ModemPinSet(0);
                setTimeout(function () {
                    try {
                        ModemPinSet(1);
                        setTimeout(function () {
                            try {
                                fs.exists(config.Modem.Path, function (exists) {
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
            }, 1000);

        } catch (error) {
            console.log('modem3g > ModemReboot > Error: ' + error);
        }
    });
}

function SakisReconnect() {
    setTimeout(function() {
        try {
            spawn('sakis3g', ['reconnect'], {stdio: 'inherit'}).on('exit', function (code) {
                if (code == 0) {
                    reconnectCallback();
                } else {
                    setTimeout(function () {
                        Reconnect(reconnectCallback); // Sakis not have connect
                    }, 10000);
                }
            });
        } catch (error) {
            console.log('modem3g > SakisReconnect > Error: ' + error);
        }
    });
}

function Reconnect(callback) {
    setTimeout(function() {
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
    });
}

module.exports = {
    reconnect: Reconnect
};