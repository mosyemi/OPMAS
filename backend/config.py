"""
OPMAS-001 | Collector Configuration
Loads all settings from .env — nothing is hardcoded here.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# ── PLC ──────────────────────────────────────────────────────────────────────
PLC_IP           = os.getenv("PLC_IP", "192.168.1.100")
PLC_PORT         = int(os.getenv("PLC_PORT", 502))
POLL_INTERVAL    = int(os.getenv("POLL_INTERVAL", 5))   # seconds
MODBUS_TIMEOUT   = 3                                      # seconds per attempt
MODBUS_RETRIES   = 3

# ── Database ─────────────────────────────────────────────────────────────────
DB_HOST     = os.getenv("DB_HOST", "localhost")
DB_PORT     = int(os.getenv("DB_PORT", 3306))
DB_NAME     = os.getenv("DB_NAME", "opmas_db")
DB_USER     = os.getenv("DB_USER", "opmas_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "changeme")

# ── Alarm Thresholds (overridden by DB values at runtime) ────────────────────
ALARM_THRESHOLDS = {
    "O2_PURITY": {
        "warning_low":  90.0,
        "critical_low": 85.0,
    },
    "PRESSURE": {
        "warning_low":   3.5,
        "critical_low":  3.0,
        "warning_high":  7.0,
        "critical_high": 8.0,
    },
    "COLLECTOR_HEARTBEAT_TIMEOUT": 60,  # seconds
}

# ── Logging ───────────────────────────────────────────────────────────────────
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FILE  = os.getenv("LOG_FILE", "logs/collector.log")
