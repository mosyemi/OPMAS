"""
OPMAS-001 | Data Writer
Saves collector readings to PostgreSQL and manages heartbeat.
"""
import logging
from datetime import datetime, timezone
import database

logger = logging.getLogger(__name__)


class DataWriter:

    def save(self, readings: list[dict]):
        """Insert a batch of register readings into sensor_readings."""
        if not readings:
            return

        ts = datetime.now(timezone.utc)
        # Build a single flat row from all readings in this cycle
        row = {r["key"]: r["value"] for r in readings}

        query = """
            INSERT INTO sensor_readings (
                timestamp,
                o2_purity, o2_purity_raw,
                pressure, pressure_raw,
                flow_rate, flow_rate_raw,
                temperature, temperature_raw,
                tank_level, tank_level_raw,
                compressor_status,
                bed_a_status, bed_b_status,
                bed_a_hours, bed_b_hours,
                data_quality
            ) VALUES (
                %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                'good'
            )
        """
        params = (
            ts,
            row.get("O2_PURITY"),      row.get("O2_PURITY_RAW"),
            row.get("PRESSURE"),       row.get("PRESSURE_RAW"),
            row.get("FLOW_RATE"),      row.get("FLOW_RATE_RAW"),
            row.get("TEMPERATURE"),    row.get("TEMPERATURE_RAW"),
            row.get("TANK_LEVEL"),     row.get("TANK_LEVEL_RAW"),
            row.get("COMPRESSOR"),
            row.get("BED_A_STATUS"),   row.get("BED_B_STATUS"),
            row.get("BED_A_HOURS"),    row.get("BED_B_HOURS"),
        )

        try:
            database.execute(query, params)
        except Exception as e:
            logger.error(f"Failed to save readings: {e}")

    def update_heartbeat(self):
        """Update the collector heartbeat timestamp."""
        database.execute(
            "UPDATE collector_status SET last_seen = NOW() WHERE id = 1"
        )

    def record_timeout(self, failure_count: int):
        """Record a failed poll cycle."""
        database.execute(
            """
            INSERT INTO sensor_readings (timestamp, data_quality)
            VALUES (NOW(), 'timeout')
            """
        )
        database.execute(
            """
            UPDATE collector_status
            SET last_seen = NOW(), consecutive_failures = %s
            WHERE id = 1
            """,
            (failure_count,)
        )
