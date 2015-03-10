import serial
import time
import struct
import queue

qGpsPackets = queue.Queue()

gps = serial.Serial("/dev/ttyAMA0", baudrate=9600, timeout=0)

while True:
	try:
		sym = gps.read().decode('ascii')
		if sym == "$":
			print(s)
			s = sym
		else:
			s += sym
	except Exception as error:
		print(error)
		pass
		gps = serial.Serial("/dev/ttyAMA0", baudrate=9600, timeout=0)