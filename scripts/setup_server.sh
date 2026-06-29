#!/bin/bash
# OPMAS-001 | Server Setup Script (SRV-01 — Ubuntu 24.04 LTS)
# Run once as root after fresh Ubuntu install.
# Usage: sudo bash setup_server.sh

set -e
echo "======================================"
echo "  OPMAS-001 Server Setup — SRV-01"
echo "======================================"

# ── System updates ─────────────────────────────────────────────────────────
apt update && apt upgrade -y

# ── Python 3 + pip ─────────────────────────────────────────────────────────
apt install -y python3 python3-pip python3-venv
pip3 install pymodbus mysql-connector-python python-dotenv

# ── MySQL ────────────────────────────────────────────────────────────────────
apt install -y mysql-server
systemctl enable mysql && systemctl start mysql

echo "Running MySQL schema..."
mysql -u root < /opt/opmas/database/migrations/001_create_schema.sql
mysql -u root < /opt/opmas/database/migrations/002_seed_data.sql

# ── PHP 8.3 + Composer ─────────────────────────────────────────────────────
apt install -y php8.3 php8.3-fpm php8.3-mysql php8.3-mbstring php8.3-xml php8.3-curl
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# ── Node.js + npm ──────────────────────────────────────────────────────────
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# ── Nginx ──────────────────────────────────────────────────────────────────
apt install -y nginx
systemctl enable nginx

# ── Supervisor ─────────────────────────────────────────────────────────────
apt install -y supervisor
systemctl enable supervisor

# ── Logs directory ─────────────────────────────────────────────────────────
mkdir -p /var/log/opmas
chown www-data:www-data /var/log/opmas

echo ""
echo "======================================"
echo "  Setup complete."
echo "  Next steps:"
echo "  1. Run database migrations"
echo "  2. Deploy Python collector"
echo "  3. Deploy Laravel app"
echo "  4. Configure Nginx"
echo "  5. Set up SSL certificate"
echo "======================================"
