"""
OPMAS-001 | PLC Modbus TCP Reader
READ ONLY — this module never calls write_register or any write method.
Only read_holding_registers() and read_input_registers() are used.
"""
import logging
from pymodbus.client import ModbusTcpClient
from pymodbus.exceptions import ModbusException
from config import PLC_IP, PLC_PORT, MODBUS_TIMEOUT, MODBUS_RETRIES

logger = logging.getLogger(__name__)

# ── Register Map ──────────────────────────────────────────────────────────────
# Populated after site visit and register mapping exercise.
# Format: { "KEY": { "address": int, "count": int, "scale": float, "unit": str } }
#
# Scale:  raw register value / scale = engineering value
#   e.g.  scale=10 means register 934 → 93.4 %
#
# Status: "pending" until confirmed by cross-referencing HMI vs register reads.
#
REGISTER_MAP = {
    "O2_PURITY":      {"address": None, "count": 1, "scale": 10.0, "unit": "%",     "status": "pending"},
    "PRESSURE":       {"address": None, "count": 1, "scale": 10.0, "unit": "bar",   "status": "pending"},
    "FLOW_RATE":      {"address": None, "count": 1, "scale": 10.0, "unit": "L/min", "status": "pending"},
    "TEMPERATURE":    {"address": None, "count": 1, "scale": 10.0, "unit": "°C",    "status": "pending"},
    "TANK_LEVEL":     {"address": None, "count": 1, "scale": 10.0, "unit": "%",     "status": "pending"},
    "COMPRESSOR":     {"address": None, "count": 1, "scale": 1.0,  "unit": None,    "status": "pending"},
    "BED_A_STATUS":   {"address": None, "count": 1, "scale": 1.0,  "unit": None,    "status": "pending"},
    "BED_B_STATUS":   {"address": None, "count": 1, "scale": 1.0,  "unit": None,    "status": "pending"},
    "BED_A_HOURS":    {"address": None, "count": 2, "scale": 1.0,  "unit": "hours", "status": "pending"},
    "BED_B_HOURS":    {"address": None, "count": 2, "scale": 1.0,  "unit": "hours", "status": "pending"},
}


class PLCReader:
    def __init__(self):
        self.client = None
        self._connect()

    def _connect(self) -> bool:
        """Establish Modbus TCP connection to PLC."""
        try:
            self.client = ModbusTcpClient(
                host=PLC_IP,
                port=PLC_PORT,
                timeout=MODBUS_TIMEOUT,
                retries=MODBUS_RETRIES,
            )
            connected = self.client.connect()
            if connected:
                logger.info(f"Connected to PLC at {PLC_IP}:{PLC_PORT}")
            else:
                logger.error(f"Failed to connect to PLC at {PLC_IP}:{PLC_PORT}")
            return connected
        except Exception as e:
            logger.error(f"PLC connection error: {e}")
            return False

    def _ensure_connected(self) -> bool:
        if self.client and self.client.connected:
            return True
        logger.warning("PLC disconnected — attempting reconnect")
        return self._connect()

    def read_all(self) -> list[dict]:
        """
        Read all configured registers in REGISTER_MAP.
        Returns a list of reading dicts. Skips registers with address=None (pending).
        NEVER calls any write method.
        """
        if not self._ensure_connected():
            return []

        readings = []
        for key, reg in REGISTER_MAP.items():
            if reg["address"] is None:
                continue  # Not mapped yet — skip silently

            reading = self._read_register(key, reg)
            if reading:
                readings.append(reading)

        return readings

    def _read_register(self, key: str, reg: dict) -> dict | None:
        """Read a single register and return a normalised dict."""
        try:
            # SAFETY: Only read_holding_registers is used — no writes ever.
            result = self.client.read_holding_registers(
                address=reg["address"],
                count=reg["count"],
            )
            if result.isError():
                logger.warning(f"Register read error for {key} @ addr {reg['address']}: {result}")
                return None

            raw = result.registers[0] if reg["count"] == 1 else (result.registers[0] << 16 | result.registers[1])
            value = round(raw / reg["scale"], 2)

            return {
                "key":       key,
                "address":   reg["address"],
                "raw":       raw,
                "value":     value,
                "unit":      reg["unit"],
                "quality":   "good",
            }

        except ModbusException as e:
            logger.error(f"Modbus exception reading {key}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error reading {key}: {e}")
            return None

    def scan_registers(self, start: int = 0, end: int = 400, batch: int = 10):
        """
        Discovery utility — scans all registers and prints non-zero values.
        Run this on site to build the register map.
        Usage: python3 -c "from plc.reader import PLCReader; PLCReader().scan_registers()"
        """
        if not self._ensure_connected():
            print("Cannot connect to PLC")
            return

        print(f"Scanning registers {start} to {end}...")
        for addr in range(start, end, batch):
            result = self.client.read_holding_registers(address=addr, count=min(batch, end - addr))
            if not result.isError():
                values = result.registers
                non_zero = [(addr + i, v) for i, v in enumerate(values) if v != 0]
                if non_zero:
                    for a, v in non_zero:
                        print(f"  Register {a:>4}: {v}")

    def close(self):
        if self.client:
            self.client.close()
            logger.info("PLC connection closed")
