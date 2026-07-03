<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MonitoringController extends Controller
{
    public function latest()
    {
        return response()->json([
            'timestamp' => now()->toISOString(),
            'collector_alive' => true,
            'readings' => [
                ['key' => 'O2_PURITY', 'label' => 'Oxygen Purity', 'value' => 93.4, 'unit' => '%', 'status' => 'normal'],
                ['key' => 'PRESSURE', 'label' => 'System Pressure', 'value' => 4.8, 'unit' => 'bar', 'status' => 'normal'],
                ['key' => 'FLOW_RATE', 'label' => 'Flow Rate', 'value' => 12.5, 'unit' => 'L/min', 'status' => 'normal'],
                ['key' => 'TEMPERATURE', 'label' => 'Temperature', 'value' => 26.3, 'unit' => '°C', 'status' => 'normal'],
                ['key' => 'TANK_LEVEL', 'label' => 'Tank Level', 'value' => 78.0, 'unit' => '%', 'status' => 'normal'],
                ['key' => 'COMPRESSOR', 'label' => 'Compressor', 'value' => 1, 'unit' => null, 'status' => 'running'],
                ['key' => 'BED_A_STATUS', 'label' => 'Bed A', 'value' => 1, 'unit' => null, 'status' => 'active'],
                ['key' => 'BED_B_STATUS', 'label' => 'Bed B', 'value' => 0, 'unit' => null, 'status' => 'idle'],
                ['key' => 'BED_A_HOURS', 'label' => 'Bed A Hours', 'value' => 121.5, 'unit' => 'hrs', 'status' => 'normal'],
                ['key' => 'BED_B_HOURS', 'label' => 'Bed B Hours', 'value' => 119.2, 'unit' => 'hrs', 'status' => 'normal'],
            ],
        ]);
    }

    public function history(Request $request)
    {
        $register = $request->input('register', 'O2_PURITY');
        $now = time();
        $baseValues = [
            'O2_PURITY' => 93.0,
            'PRESSURE' => 4.5,
            'FLOW_RATE' => 12.0,
            'TANK_LEVEL' => 70.0,
        ];
        $base = $baseValues[$register] ?? 50;

        $data = [];
        for ($i = 0; $i < 48; $i++) {
            $ts = date('c', $now - (47 - $i) * 5 * 60);
            $value = round($base + (rand(-20, 20) / 10), 2);
            $data[] = ['ts' => $ts, 'value' => $value];
        }

        if ($register === 'O2_PURITY') {
            $data[20]['value'] = 88.2;
            $data[21]['value'] = 87.9;
        }

        return response()->json([
            'register' => $register,
            'unit' => '%',
            'data' => $data,
        ]);
    }

    public function alarms()
    {
        return response()->json([
            'alarms' => [
                [
                    'id' => 1,
                    'type' => 'LOW_PURITY',
                    'severity' => 'WARNING',
                    'message' => 'O2 purity below warning level: 89.2% (threshold: 90%)',
                    'triggered_at' => now()->subMinutes(5)->toISOString(),
                    'resolved_at' => null,
                ],
                [
                    'id' => 2,
                    'type' => 'LOW_PURITY',
                    'severity' => 'WARNING',
                    'message' => 'O2 purity below warning level: 87.5% — resolved automatically',
                    'triggered_at' => now()->subHours(4)->toISOString(),
                    'resolved_at' => now()->subHours(3)->toISOString(),
                ],
            ],
        ]);
    }

    public function resolveAlarm($id)
    {
        return response()->json([
            'id' => (int) $id,
            'status' => 'resolved',
            'resolved_at' => now()->toISOString(),
        ]);
    }



    public function login(Request $request)
    {
        $email = $request->input('email', 'operator@example.com');
        $password = $request->input('password', 'password');

        if ($email && $password) {
            return response()->json([
                'token' => 'demo-token',
                'user' => ['name' => 'Operator', 'email' => $email],
            ]);
        }

        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    public function logout()
    {
        return response()->json(['message' => 'Logged out']);
    }

    public function collectorStatus()
    {
        return response()->json([
            'alive' => true,
            'last_seen' => now()->toISOString(),
            'failures' => 0,
        ]);
    }
}
