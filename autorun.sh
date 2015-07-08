#!/usr/bin/env bash
# Start DHCP server
sudo -u root -p root service isc-dhcp-server start

# Start Access Point 'skd'
sudo -u root -p root hostapd -B /etc/hostapd/hostapd.conf

# Run sander
sudo -u root -p root bash /devir/Devir.RPi.GPS/start.sh

sudo -u root -p root /devir/test/on

exit 0