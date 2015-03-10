import serial
import time
import struct
import queue
import threading

qGpsPackets = queue.Queue()
s = ""
sTake = list("RMC", "VTG", "GGA", "GSA", "GSV")
packet = list()

gps = serial.Serial("/dev/ttyAMA0", baudrate=9600, timeout=0)

def ReadFromGPS():
	while True:
		try:
			sym = gps.read().decode('ascii')
			if sym == "$":
				if s[3:7] == "RMC":
					qGpsPackets.pop(packet)
					packet = list()
				else:
					packet.append(s)
				s = sym
			else:
				s += sym
		except Exception as error:
			print(error)
			pass
			gps = serial.Serial("/dev/ttyAMA0", baudrate=9600, timeout=0)

def PrintFromQueue():
	if q.qsize() > 0:
		p = q.get()
		for (i in p)
			print(p[i])

print("Gps started")

tReadFromGPS = threading.Thread(target=ReadFromGPS, args = (q,))
tReadFromGPS.daemon = True
tReadFromGPS.start()

tPrintFromQueue = threading.Thread(target=ReadFromGPS, args = (q,))
tPrintFromQueue.daemon = True
tPrintFromQueue.start()

tReadFromGPS.join()
tPrintFromQueue.join()