#!/usr/bin/env bash

# NAT
iptables -t nat -A POSTROUTING -o ppp0 -j MASQUERADE

# Run zander
sudo -u root -p root bash /devir/Devir.RPi.GPS/start.sh

exit 0