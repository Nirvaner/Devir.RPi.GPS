#!/usr/bin/env bash

# NAT
sudo -u root -p root iptables -t nat -A POSTROUTING -o ppp0 -j MASQUERADE

# run Zander
sudo -u root -p root bash /devir/Devir.RPi.GPS/start.sh

exit 0