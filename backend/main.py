"""
OPMAS-001 | Collector Entry Point
Polls PLC via Modbus TCP every POLL_INTERVAL seconds and writes to PostgreSQL.

Run:   python3 main.py
Prod:  managed by Supervisor (see /etc/supervisor/conf.d/opmas-collector.conf)
"""

import os
import time
import logging
import signal
import sys
from logging.handlers import RotatingFileHandler

from config import POLL_INTERVAL, LOG_LEVEL, LOG_FILE, PLC_ENABLED
from plc.reader import PLCReader
from services.writer import DataWriter
from alarms.engine import AlarmEngine
import database


# ── Logging setup ─────────────────────────────────────────────────────────────
def setup_logging():
    # Ensure the log directory exists
    log_dir = os.path.dirname(LOG_FILE)
    if log_dir:
        os.makedirs(log_dir, exist_ok=True)

    fmt = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"

    handlers = [
        logging.StreamHandler(sys.stdout),
        RotatingFileHandler(
            LOG_FILE,
            maxBytes=5_000_000,
            backupCount=3,
            encoding="utf-8",
        ),
    ]

    logging.basicConfig(
        level=getattr(logging, LOG_LEVEL.upper(), logging.INFO),
        format=fmt,
        handlers=handlers,
        force=True,
    )


logger = logging.getLogger("opmas.main")


# ── Graceful shutdown ─────────────────────────────────────────────────────────
running = True


def shutdown(signum, frame):
    global running
    logger.info(f"Received signal {signum} — shutting down gracefully")
    running = False


signal.signal(signal.SIGTERM, shutdown)
signal.signal(signal.SIGINT, shutdown)


# ── Main loop ─────────────────────────────────────────────────────────────────
def main():
    setup_logging()
    logger.info("OPMAS-001 Collector starting")

    plc = PLCReader() if PLC_ENABLED else None
    writer = DataWriter()
    alarms = AlarmEngine()

    consecutive_failures = 0

    while running:
        cycle_start = time.time()

        if not PLC_ENABLED:
            logger.info("PLC polling disabled — skipping cycle.")
            try:
                writer.update_heartbeat()
            except Exception as e:
                logger.warning(f"Heartbeat update failed: {e}")
            time.sleep(POLL_INTERVAL)
            continue

        try:
            readings = plc.read_all()

            if readings:
                writer.save(readings)
                alarms.evaluate(readings)
                writer.update_heartbeat()
                consecutive_failures = 0
                logger.debug(f"Cycle OK — {len(readings)} registers read")
            else:
                consecutive_failures += 1
                logger.warning(f"Empty reading (failure #{consecutive_failures})")
                writer.record_timeout(consecutive_failures)

        except Exception as e:
            consecutive_failures += 1
            logger.exception(
                f"Collector cycle error (failure #{consecutive_failures}): {e}"
            )
            writer.record_timeout(consecutive_failures)

        elapsed = time.time() - cycle_start
        time.sleep(max(0, POLL_INTERVAL - elapsed))

    database.close_pool()
    logger.info("Collector stopped cleanly")


if __name__ == "__main__":
    main()