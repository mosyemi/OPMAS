-- ─────────────────────────────────────────────────────────────────────────────
-- OPMAS-001 | Migration 002 — Seed / Mock Data (MySQL)
-- Run: mysql -u opmas_user -p opmas_db < 002_seed_data.sql
-- ─────────────────────────────────────────────────────────────────────────────

USE opmas_db;

-- Default users (password field is a placeholder — Laravel will hash properly)
INSERT IGNORE INTO users (name, email, role, password) VALUES
    ('System Admin',   'admin@opmas.local',    'admin',    '$2y$12$placeholder_change_on_first_login'),
    ('Plant Operator', 'operator@opmas.local', 'operator', '$2y$12$placeholder_change_on_first_login'),
    ('Viewer',         'viewer@opmas.local',   'viewer',   '$2y$12$placeholder_change_on_first_login'),
    ('TEST USER',      'test@opmas.local',    'test',     '$2y$12$placeholder_change_on_first_login');

-- 24 hours of mock sensor readings (every 5 minutes = 288 rows)
-- MySQL uses a recursive CTE or a numbers table; we use a stored procedure here
DROP PROCEDURE IF EXISTS seed_readings;

DELIMITER $$
CREATE PROCEDURE seed_readings()
BEGIN
    DECLARE i INT DEFAULT 1;
    WHILE i <= 288 DO
        INSERT INTO sensor_readings (
            timestamp,
            o2_purity, pressure, flow_rate, temperature, tank_level,
            compressor_status, bed_a_status, bed_b_status,
            bed_a_hours, bed_b_hours, data_quality
        ) VALUES (
            DATE_SUB(NOW(), INTERVAL (288 - i) * 5 MINUTE),
            -- O2 purity: dip between rows 50-55
            IF(i BETWEEN 50 AND 55, 87.5 + RAND() * 2, 92.5 + RAND() * 3),
            4.0 + RAND() * 1.5,
            10.0 + RAND() * 5,
            24.0 + RAND() * 4,
            60.0 + RAND() * 30,
            1,              -- compressor running
            MOD(i, 2),      -- beds alternating
            MOD(i + 1, 2),
            ROUND(120.5 + i * 0.083, 2),
            ROUND(118.2 + i * 0.083, 2),
            'good'
        );
        SET i = i + 1;
    END WHILE;
END$$
DELIMITER ;

CALL seed_readings();
DROP PROCEDURE IF EXISTS seed_readings;

-- One resolved alarm
INSERT INTO alarms (type, severity, message, created_at, resolved_at) VALUES
    ('LOW_PURITY', 'WARNING',
     'O2 purity below warning level: 87.5% (threshold: 90%)',
     DATE_SUB(NOW(), INTERVAL 250 MINUTE),
     DATE_SUB(NOW(), INTERVAL 240 MINUTE));

-- One active alarm for UI testing
INSERT INTO alarms (type, severity, message, created_at) VALUES
    ('LOW_PURITY', 'WARNING',
     'O2 purity below warning level: 89.2% — monitor closely',
     DATE_SUB(NOW(), INTERVAL 5 MINUTE));

-- Heartbeat
UPDATE collector_status SET last_seen = NOW(), consecutive_failures = 0 WHERE id = 1;

SELECT 'Seed data inserted' AS status;
SELECT COUNT(*) AS reading_count FROM sensor_readings;
