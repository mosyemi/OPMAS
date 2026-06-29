"""
OPMAS-001 | PLC Connection Test
Run this on site to confirm Modbus TCP connectivity.

Usage:
    python3 test_plc.py
    python3 test_plc.py --ip 192.168.1.100
    python3 test_plc.py --scan        # scan all registers 0-400
"""
import sys
import argparse
from pymodbus.client import ModbusTcpClient

def test_connection(ip: str, port: int = 502):
    print(f"\n{'='*50}")
    print(f"OPMAS-001 | PLC Connection Test")
    print(f"Target: {ip}:{port}")
    print(f"{'='*50}\n")

    client = ModbusTcpClient(ip, port=port, timeout=5)

    print(f"[1] Connecting to {ip}:{port}...")
    if not client.connect():
        print("    FAILED — Cannot connect. Check IP, cable, and Port 502.")
        sys.exit(1)
    print("    OK — Connected\n")

    print("[2] Reading first 10 registers (address 0-9)...")
    result = client.read_holding_registers(address=0, count=10)
    if result.isError():
        print(f"    FAILED — {result}")
    else:
        print(f"    OK — Registers 0-9: {result.registers}\n")

    print("[3] Reading input registers (address 0-9)...")
    result2 = client.read_input_registers(address=0, count=10)
    if result2.isError():
        print(f"    WARNING — Input registers not available: {result2}")
    else:
        print(f"    OK — Input registers 0-9: {result2.registers}\n")

    client.close()
    print("Connection test complete. PLC is reachable and responding.\n")

def scan_registers(ip: str, port: int = 502):
    print(f"\nScanning all registers 0-400 on {ip}:{port}...\n")
    client = ModbusTcpClient(ip, port=port, timeout=5)
    if not client.connect():
        print("Cannot connect to PLC")
        sys.exit(1)

    for start in range(0, 400, 10):
        result = client.read_holding_registers(address=start, count=10)
        if not result.isError():
            values = result.registers
            non_zero = [(start + i, v) for i, v in enumerate(values) if v not in (0, 5)]
            if non_zero:
                for addr, val in non_zero:
                    print(f"  Register {addr:>4}:  raw={val:>6}   (possible scaled: {val/10:.1f})")
    client.close()
    print("\nScan complete. Cross-reference non-zero values with HMI readings.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OPMAS-001 PLC Test")
    parser.add_argument("--ip",   default="192.168.1.100", help="PLC IP address")
    parser.add_argument("--port", type=int, default=502,   help="Modbus port (default 502)")
    parser.add_argument("--scan", action="store_true",     help="Scan all registers")
    args = parser.parse_args()

    if args.scan:
        scan_registers(args.ip, args.port)
    else:
        test_connection(args.ip, args.port)
