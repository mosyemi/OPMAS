-- ─────────────────────────────────────────────────────────────────────────────
-- OPMAS-001 | Migration 001 — Core Schema (MySQL)
-- Run as root: mysql -u root -p < 001_create_schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- Create database and user
CREATE DATABASE IF NOT EXISTS opmas_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'opmas_user'@'localhost' IDENTIFIED BY 'changeme';
GRANT ALL PRIVILEGES ON opmas_db.* TO 'opmas_user'@'localhost';
FLUSH PRIVILEGES;

USE opmas_db;

-- ── sensor_readings ──────────────────────────────────────────────────────────
-- One row every POLL_INTERVAL seconds from the PLC collector.

CREATE TABLE IF NOT EXISTS sensor_readings (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    timestamp           DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    -- Engineering values (scaled)
    o2_purity           DECIMAL(6,2)    NULL COMMENT '%',
    pressure            DECIMAL(6,2)    NULL COMMENT 'bar',
    flow_rate           DECIMAL(8,2)    NULL COMMENT 'L/min',
    temperature         DECIMAL(6,2)    NULL COMMENT 'degrees C',
    tank_level          DECIMAL(6,2)    NULL COMMENT '%',

    -- Raw Modbus register values (for debugging)
    o2_purity_raw       INT             NULL,
    pressure_raw        INT             NULL,
    flow_rate_raw       INT             NULL,
    temperature_raw     INT             NULL,
    tank_level_raw      INT             NULL,

    -- Status registers
    compressor_status   TINYINT         NULL COMMENT '0=OFF 1=RUN 2=FAULT',
    bed_a_status        TINYINT         NULL COMMENT '0=Idle 1=Active',
    bed_b_status        TINYINT         NULL COMMENT '0=Idle 1=Active',
    bed_a_hours         DECIMAL(10,2)   NULL COMMENT 'hours',
    bed_b_hours         DECIMAL(10,2)   NULL COMMENT 'hours',

    -- Data quality flag
    data_quality        VARCHAR(10)     NOT NULL DEFAULT 'good'
                        COMMENT 'good | timeout | error',

    INDEX idx_timestamp (timestamp DESC),
    INDEX idx_quality   (data_quality, timestamp DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ── registers ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS registers (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `key`       VARCHAR(50)     NOT NULL UNIQUE,
    label       VARCHAR(100)    NOT NULL,
    address     INT             NULL COMMENT 'Modbus address — NULL until mapped',
    `count`     TINYINT         NOT NULL DEFAULT 1,
    scale       DECIMAL(10,4)   NOT NULL DEFAULT 1,
    unit        VARCHAR(20)     NULL,
    data_type   VARCHAR(20)     NOT NULL DEFAULT 'INT16',
    status      VARCHAR(20)     NOT NULL DEFAULT 'pending'
                COMMENT 'pending | confirmed',
    notes       TEXT            NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO registers (`key`, label, address, scale, unit, status) VALUES
    ('O2_PURITY',    'Oxygen Purity',     NULL, 10.0, '%',     'pending'),
    ('PRESSURE',     'System Pressure',   NULL, 10.0, 'bar',   'pending'),
    ('FLOW_RATE',    'Flow Rate',         NULL, 10.0, 'L/min', 'pending'),
    ('TEMPERATURE',  'Temperature',       NULL, 10.0, 'C',     'pending'),
    ('TANK_LEVEL',   'Tank Level',        NULL, 10.0, '%',     'pending'),
    ('COMPRESSOR',   'Compressor Status', NULL, 1.0,  NULL,    'pending'),
    ('BED_A_STATUS', 'Bed A Status',      NULL, 1.0,  NULL,    'pending'),
    ('BED_B_STATUS', 'Bed B Status',      NULL, 1.0,  NULL,    'pending'),
    ('BED_A_HOURS',  'Bed A Hours',       NULL, 1.0,  'hours', 'pending'),
    ('BED_B_HOURS',  'Bed B Hours',       NULL, 1.0,  'hours', 'pending');


-- ── users ────────────────────────────────────────────────────────────────────
-- Create users first — alarms references it

CREATE TABLE IF NOT EXISTS users (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(150)    NOT NULL UNIQUE,
    role        VARCHAR(20)     NOT NULL DEFAULT 'viewer'
                COMMENT 'admin | operator | viewer',
    password    VARCHAR(255)    NOT NULL COMMENT 'bcrypt hashed',
    is_active   TINYINT(1)      NOT NULL DEFAULT 1,
    last_login  DATETIME        NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ── alarms ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS alarms (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type         VARCHAR(50)     NOT NULL,
    severity     VARCHAR(20)     NOT NULL COMMENT 'CRITICAL | WARNING | INFO',
    message      TEXT            NOT NULL,
    created_at   DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    resolved_at  DATETIME(3)     NULL,
    resolved_by  INT UNSIGNED    NULL,

    INDEX idx_active   (resolved_at),
    INDEX idx_severity (severity, created_at DESC),
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ── alarm_thresholds ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS alarm_thresholds (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    register_key VARCHAR(50)     NOT NULL,
    direction    VARCHAR(10)     NOT NULL COMMENT 'high | low',
    warning      DECIMAL(10,4)   NULL,
    critical     DECIMAL(10,4)   NULL,
    enabled      TINYINT(1)      NOT NULL DEFAULT 1,
    updated_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (register_key) REFERENCES registers(`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO alarm_thresholds (register_key, direction, warning, critical) VALUES
    ('O2_PURITY', 'low',  90.0, 85.0),
    ('PRESSURE',  'low',   3.5,  3.0),
    ('PRESSURE',  'high',  7.0,  8.0);


-- ── equipment ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS equipment (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code         VARCHAR(20)     NOT NULL UNIQUE,
    name         VARCHAR(100)    NOT NULL,
    type         VARCHAR(50)     NULL,
    status       VARCHAR(20)     NOT NULL DEFAULT 'unknown',
    last_service DATE            NULL,
    next_service DATE            NULL,
    notes        TEXT            NULL,
    created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO equipment (code, name, type) VALUES
    ('COMP-01',  'Air Compressor',      'compressor'),
    ('BED-A',    'PSA Tower Bed A',     'adsorber'),
    ('BED-B',    'PSA Tower Bed B',     'adsorber'),
    ('TANK-01',  'Oxygen Receiver',     'tank'),
    ('DRYER-01', 'Air Dryer / Filters', 'dryer');


-- ── collector_status ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS collector_status (
    id                   TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
    last_seen            DATETIME(3)     NULL,
    consecutive_failures INT             NOT NULL DEFAULT 0,
    started_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO collector_status (id) VALUES (1);


-- ── reports ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reports (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type         VARCHAR(50)     NOT NULL COMMENT 'daily | monthly | equipment',
    period_start DATE            NOT NULL,
    period_end   DATE            NOT NULL,
    generated_by INT UNSIGNED    NULL,
    file_path    VARCHAR(255)    NULL,
    created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT 'OPMAS-001 MySQL schema created successfully' AS status;
