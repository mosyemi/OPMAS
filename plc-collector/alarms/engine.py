"""
OPMAS-001 | Alarm Engine
Evaluates each reading cycle against thresholds and inserts alarms into the DB.
"""
import logging
from datetime import datetime, timezone
from config import ALARM_THRESHOLDS
import database

logger = logging.getLogger(__name__)


class AlarmEngine:

    def evaluate(self, readings: list[dict]):
        """Check readings against thresholds. Insert alarm rows for any breach."""
        row = {r["key"]: r["value"] for r in readings if r.get("quality") == "good"}

        self._check_purity(row.get("O2_PURITY"))
        self._check_pressure(row.get("PRESSURE"))
        self._check_compressor(row.get("COMPRESSOR"))

    # ── Individual checks ────────────────────────────────────────────────────

    def _check_purity(self, value):
        if value is None:
            return
        t = ALARM_THRESHOLDS["O2_PURITY"]
        if value < t["critical_low"]:
            self._raise("LOW_PURITY", "CRITICAL",
                        f"O2 purity critically low: {value}% (threshold: {t['critical_low']}%)")
        elif value < t["warning_low"]:
            self._raise("LOW_PURITY", "WARNING",
                        f"O2 purity below warning level: {value}% (threshold: {t['warning_low']}%)")

    def _check_pressure(self, value):
        if value is None:
            return
        t = ALARM_THRESHOLDS["PRESSURE"]
        if value < t["critical_low"]:
            self._raise("LOW_PRESSURE", "CRITICAL",
                        f"System pressure critically low: {value} bar")
        elif value < t["warning_low"]:
            self._raise("LOW_PRESSURE", "WARNING",
                        f"System pressure low: {value} bar")
        elif value > t["critical_high"]:
            self._raise("HIGH_PRESSURE", "CRITICAL",
                        f"System pressure critically high: {value} bar")
        elif value > t["warning_high"]:
            self._raise("HIGH_PRESSURE", "WARNING",
                        f"System pressure high: {value} bar")

    def _check_compressor(self, value):
        if value is None:
            return
        if int(value) == 2:
            self._raise("COMPRESSOR_FAULT", "CRITICAL",
                        "Compressor fault detected (status=2)")

    # ── DB write ─────────────────────────────────────────────────────────────

    def _raise(self, alarm_type: str, severity: str, message: str):
        """Insert a new alarm unless an identical unresolved alarm already exists."""
        existing = database.execute(
            """
            SELECT id FROM alarms
            WHERE type = %s AND severity = %s AND resolved_at IS NULL
            LIMIT 1
            """,
            (alarm_type, severity),
            fetch=True,
        )
        if existing:
            return  # Already active — do not duplicate

        database.execute(
            """
            INSERT INTO alarms (type, severity, message, created_at)
            VALUES (%s, %s, %s, %s)
            """,
            (alarm_type, severity, message, datetime.now(timezone.utc)),
        )
        logger.warning(f"ALARM [{severity}] {alarm_type}: {message}")
