<?php

use App\Http\Controllers\Web\AuthController;
use App\Http\Controllers\Web\DashboardController;
use Illuminate\Support\Facades\Route;

// Redirect root to dashboard (will hit auth middleware first)
Route::get('/', function () {
    return redirect('/dashboard');
});

// Guest Authentication Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth');

// Protected Dashboard Routes
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/alarms', [DashboardController::class, 'alarms']);
    Route::get('/equipment', [DashboardController::class, 'equipment']);
    Route::get('/reports', [DashboardController::class, 'reports']);
});