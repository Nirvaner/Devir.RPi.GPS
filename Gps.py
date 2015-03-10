import serial
import time
import struct
import queue
import threading

qGpsPackets = queue.Queue()
s = ""
sTake = list(("RMC", "VTG", "GGA", "GSA", "GSV"))
packet = list()

gps = serial.Serial("/dev/ttyAMA0", baudrate=9600, timeout=0)

def ReadFromGPS():
	global gps
	global qGpsPackets
	global packet
	global s
	while True:
		try:
			sym = gps.read().decode('ascii')
			if sym == "$":
				if s[3:6] == "RMC":
					qGpsPackets.put(packet)
					packet = list()
					time.sleep(0.01)
				if s[3:6] in sTake:
					packet.append(s)
				s = sym
			else:
				s += sym
		except Exception as error:
			print(error)
			pass
			gps = serial.Serial("/dev/ttyAMA0", baudrate=9600, timeout=0)

def PrintFromQueue():
	while True:
		if qGpsPackets.qsize() > 0:
			p = qGpsPackets.get()
			print("Packet-------------------------------------------------", end='')
			for i in p:
				print(i)
			time.sleep(0.1)

print("Gps started")

tReadFromGPS = threading.Thread(target=ReadFromGPS)
tReadFromGPS.daemon = True
tReadFromGPS.start()

tPrintFromQueue = threading.Thread(target=PrintFromQueue)
tPrintFromQueue.daemon = True
tPrintFromQueue.start()

tReadFromGPS.join()
tPrintFromQueue.join()