<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\MonitoringController;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected $api;

    public function __construct()
    {
        // Re-use existing API mock logic so it maps data exactly as before
        $this->api = new MonitoringController();
    }

    public function index(Request $request)
    {
        $latest = $this->api->latest()->getData(true);
        $history = $this->api->history(new Request(['register' => 'O2_PURITY']))->getData(true);

        return Inertia::render('DashboardPage', [
            'initialLatest' => $latest,
            'initialHistory' => $history['data'] ?? [],
        ]);
    }

    public function alarms()
    {
        $alarms = $this->api->alarms()->getData(true);

        return Inertia::render('AlarmsPage', [
            'initialAlarms' => $alarms['alarms'] ?? [],
        ]);
    }

    public function equipment()
    {
        $equipment = $this->api->equipment()->getData(true);

        return Inertia::render('EquipmentPage', [
            'equipment' => $equipment['equipment'] ?? [],
        ]);
    }

    public function reports()
    {
        return Inertia::render('ReportsPage');
    }
}