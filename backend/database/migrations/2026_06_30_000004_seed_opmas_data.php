<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // ── Seed users ───────────────────────────────────────────────────────────────
        DB::table('users')->insertOrIgnore([
            ['name' => 'System Admin',   'email' => 'admin@opmas.local',    'password' => '$2y$12$placeholder_change_on_first_login', 'created_at' => now()],
            ['name' => 'Plant Operator', 'email' => 'operator@opmas.local', 'password' => '$2y$12$placeholder_change_on_first_login', 'created_at' => now()],
            ['name' => 'Viewer',         'email' => 'viewer@opmas.local',   'password' => '$2y$12$placeholder_change_on_first_login', 'created_at' => now()],
            ['name' => 'TEST USER',      'email' => 'test@opmas.local',     'password' => '$2y$12$placeholder_change_on_first_login', 'created_at' => now()],
        ]);

        // ── Seed registers ───────────────────────────────────────────────────────────
        DB::table('registers')->insertOrIgnore([
            ['key' => 'O2_PURITY',    'label' => 'Oxygen Purity',     'address' => null, 'scale' => 10.0, 'unit' => '%',     'status' => 'pending', 'created_at' => now()],
            ['key' => 'PRESSURE',     'label' => 'System Pressure',   'address' => null, 'scale' => 10.0, 'unit' => 'bar',   'status' => 'pending', 'created_at' => now()],
            ['key' => 'FLOW_RATE',    'label' => 'Flow Rate',         'address' => null, 'scale' => 10.0, 'unit' => 'L/min', 'status' => 'pending', 'created_at' => now()],
            ['key' => 'TEMPERATURE',  'label' => 'Temperature',       'address' => null, 'scale' => 10.0, 'unit' => 'C',     'status' => 'pending', 'created_at' => now()],
            ['key' => 'TANK_LEVEL',   'label' => 'Tank Level',        'address' => null, 'scale' => 10.0, 'unit' => '%',     'status' => 'pending', 'created_at' => now()],
            ['key' => 'COMPRESSOR',   'label' => 'Compressor Status', 'address' => null, 'scale' => 1.0,  'unit' => null,   'status' => 'pending', 'created_at' => now()],
            ['key' => 'BED_A_STATUS', 'label' => 'Bed A Status',      'address' => null, 'scale' => 1.0,  'unit' => null,   'status' => 'pending', 'created_at' => now()],
            ['key' => 'BED_B_STATUS', 'label' => 'Bed B Status',      'address' => null, 'scale' => 1.0,  'unit' => null,   'status' => 'pending', 'created_at' => now()],
            ['key' => 'BED_A_HOURS',  'label' => 'Bed A Hours',       'address' => null, 'scale' => 1.0,  'unit' => 'hours', 'status' => 'pending', 'created_at' => now()],
            ['key' => 'BED_B_HOURS',  'label' => 'Bed B Hours',       'address' => null, 'scale' => 1.0,  'unit' => 'hours', 'status' => 'pending', 'created_at' => now()],
        ]);

        // ── Seed sensor readings (24 hours, every 5 minutes = 288 rows) ────────────────
        $readings = [];
        for ($i = 1; $i <= 288; $i++) {
            $minutesAgo = (288 - $i) * 5;
            $timestamp = now()->subMinutes($minutesAgo);
            
            // O2 purity: dip between rows 50-55
            if ($i >= 50 && $i <= 55) {
                $o2_purity = 87.5 + (mt_rand(0, 200) / 100);
            } else {
                $o2_purity = 92.5 + (mt_rand(0, 300) / 100);
            }

            $readings[] = [
                'timestamp'       => $timestamp,
                'o2_purity'       => round($o2_purity, 2),
                'pressure'        => round(4.0 + (mt_rand(0, 150) / 100), 2),
                'flow_rate'       => round(10.0 + (mt_rand(0, 500) / 100), 2),
                'temperature'     => round(24.0 + (mt_rand(0, 400) / 100), 2),
                'tank_level'      => round(60.0 + (mt_rand(0, 3000) / 100), 2),
                'compressor_status' => 1,
                'bed_a_status'    => $i % 2,
                'bed_b_status'    => ($i + 1) % 2,
                'bed_a_hours'     => round(120.5 + ($i * 0.083), 2),
                'bed_b_hours'     => round(118.2 + ($i * 0.083), 2),
                'data_quality'    => 'good',
            ];
        }
        
        // Insert in chunks of 50 to avoid large query
        foreach (array_chunk($readings, 50) as $chunk) {
            DB::table('sensor_readings')->insert($chunk);
        }

        // ── Seed equipment ───────────────────────────────────────────────────────────
        DB::table('equipment')->insertOrIgnore([
            ['code' => 'COMP-01',  'name' => 'Air Compressor',      'type' => 'compressor', 'status' => 'unknown', 'created_at' => now()],
            ['code' => 'BED-A',    'name' => 'PSA Tower Bed A',     'type' => 'adsorber',   'status' => 'unknown', 'created_at' => now()],
            ['code' => 'BED-B',    'name' => 'PSA Tower Bed B',     'type' => 'adsorber',   'status' => 'unknown', 'created_at' => now()],
            ['code' => 'TANK-01',  'name' => 'Oxygen Receiver',     'type' => 'tank',       'status' => 'unknown', 'created_at' => now()],
            ['code' => 'DRYER-01', 'name' => 'Air Dryer / Filters', 'type' => 'dryer',      'status' => 'unknown', 'created_at' => now()],
        ]);

        // ── Seed alarm thresholds ────────────────────────────────────────────────────
        DB::table('alarm_thresholds')->insertOrIgnore([
            ['register_key' => 'O2_PURITY', 'direction' => 'low',  'warning' => 90.0, 'critical' => 85.0, 'enabled' => true],
            ['register_key' => 'PRESSURE',  'direction' => 'low',  'warning' => 3.5,  'critical' => 3.0,  'enabled' => true],
            ['register_key' => 'PRESSURE',  'direction' => 'high', 'warning' => 7.0,  'critical' => 8.0,  'enabled' => true],
        ]);

        // ── Seed alarms ──────────────────────────────────────────────────────────────
        // One resolved alarm
        DB::table('alarms')->insert([
            [
                'type'        => 'LOW_PURITY',
                'severity'    => 'WARNING',
                'message'     => 'O2 purity below warning level: 87.5% (threshold: 90%)',
                'created_at'  => now()->subMinutes(250),
                'resolved_at' => now()->subMinutes(240),
            ],
            [
                'type'        => 'LOW_PURITY',
                'severity'    => 'WARNING',
                'message'     => 'O2 purity below warning level: 89.2% — monitor closely',
                'created_at'  => now()->subMinutes(5),
                'resolved_at' => null,
            ],
        ]);

        // ── Seed collector status ────────────────────────────────────────────────────
        DB::table('collector_status')->updateOrInsert(
            ['id' => 1],
            [
                'last_seen'            => now(),
                'consecutive_failures' => 0,
                'started_at'           => now(),
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('alarms')->truncate();
        DB::table('alarm_thresholds')->truncate();
        DB::table('equipment')->truncate();
        DB::table('sensor_readings')->truncate();
        DB::table('registers')->truncate();
        DB::table('users')->whereIn('email', [
            'admin@opmas.local',
            'operator@opmas.local',
            'viewer@opmas.local',
            'test@opmas.local',
        ])->delete();
        DB::table('collector_status')->where('id', 1)->delete();
    }
};
