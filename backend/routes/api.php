<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MonitoringController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::get('/sensors/latest', [MonitoringController::class, 'latest']);
Route::get('/sensors/history', [MonitoringController::class, 'history']);
Route::get('/alarms', [MonitoringController::class, 'alarms']);
Route::post('/alarms/{id}/resolve', [MonitoringController::class, 'resolveAlarm']);
Route::get('/equipment', [MonitoringController::class, 'equipment']);
Route::post('/auth/login', [MonitoringController::class, 'login']);
Route::post('/auth/logout', [MonitoringController::class, 'logout']);
Route::get('/collector/heartbeat', [MonitoringController::class, 'collectorStatus']);
