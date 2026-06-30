<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // ── sensor_readings ──────────────────────────────────────────────────────────
        Schema::create('sensor_readings', function (Blueprint $table) {
            $table->id('id');
            $table->dateTime('timestamp', precision: 3)->default(DB::raw('CURRENT_TIMESTAMP(3)'));

            // Engineering values (scaled)
            $table->decimal('o2_purity', 6, 2)->nullable()->comment('%');
            $table->decimal('pressure', 6, 2)->nullable()->comment('bar');
            $table->decimal('flow_rate', 8, 2)->nullable()->comment('L/min');
            $table->decimal('temperature', 6, 2)->nullable()->comment('degrees C');
            $table->decimal('tank_level', 6, 2)->nullable()->comment('%');

            // Raw Modbus register values (for debugging)
            $table->integer('o2_purity_raw')->nullable();
            $table->integer('pressure_raw')->nullable();
            $table->integer('flow_rate_raw')->nullable();
            $table->integer('temperature_raw')->nullable();
            $table->integer('tank_level_raw')->nullable();

            // Status registers
            $table->tinyInteger('compressor_status')->nullable()->comment('0=OFF 1=RUN 2=FAULT');
            $table->tinyInteger('bed_a_status')->nullable()->comment('0=Idle 1=Active');
            $table->tinyInteger('bed_b_status')->nullable()->comment('0=Idle 1=Active');
            $table->decimal('bed_a_hours', 10, 2)->nullable()->comment('hours');
            $table->decimal('bed_b_hours', 10, 2)->nullable()->comment('hours');

            // Data quality flag
            $table->string('data_quality', 10)->default('good')->comment('good | timeout | error');

            $table->index('timestamp');
            $table->index(['data_quality', 'timestamp']);
        });

        // ── registers ────────────────────────────────────────────────────────────────
        Schema::create('registers', function (Blueprint $table) {
            $table->id();
            $table->string('key', 50)->unique();
            $table->string('label', 100);
            $table->integer('address')->nullable()->comment('Modbus address — NULL until mapped');
            $table->tinyInteger('count')->default(1);
            $table->decimal('scale', 10, 4)->default(1);
            $table->string('unit', 20)->nullable();
            $table->string('data_type', 20)->default('INT16');
            $table->string('status', 20)->default('pending')->comment('pending | confirmed');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // ── alarms ───────────────────────────────────────────────────────────────────
        Schema::create('alarms', function (Blueprint $table) {
            $table->id('id');
            $table->string('type', 50);
            $table->string('severity', 20)->comment('CRITICAL | WARNING | INFO');
            $table->text('message');
            $table->dateTime('created_at', precision: 3)->default(DB::raw('CURRENT_TIMESTAMP(3)'));
            $table->dateTime('resolved_at', precision: 3)->nullable();
            $table->unsignedBigInteger('resolved_by')->nullable();

            $table->index('resolved_at');
            $table->index(['severity', 'created_at']);
            $table->foreign('resolved_by')->references('id')->on('users')->onDelete('set null');
        });

        // ── alarm_thresholds ─────────────────────────────────────────────────────────
        Schema::create('alarm_thresholds', function (Blueprint $table) {
            $table->id();
            $table->string('register_key', 50);
            $table->string('direction', 10)->comment('high | low');
            $table->decimal('warning', 10, 4)->nullable();
            $table->decimal('critical', 10, 4)->nullable();
            $table->boolean('enabled')->default(true);
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('register_key')->references('key')->on('registers');
        });

        // ── equipment ────────────────────────────────────────────────────────────────
        Schema::create('equipment', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name', 100);
            $table->string('type', 50)->nullable();
            $table->string('status', 20)->default('unknown');
            $table->date('last_service')->nullable();
            $table->date('next_service')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        // ── collector_status ─────────────────────────────────────────────────────────
        Schema::create('collector_status', function (Blueprint $table) {
            $table->tinyInteger('id')->primary();
            $table->dateTime('last_seen', precision: 3)->nullable();
            $table->integer('consecutive_failures')->default(0);
            $table->timestamp('started_at')->useCurrent();
        });

        // ── reports ──────────────────────────────────────────────────────────────────
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->string('type', 50)->comment('daily | monthly | equipment');
            $table->date('period_start');
            $table->date('period_end');
            $table->unsignedBigInteger('generated_by')->nullable();
            $table->string('file_path', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('generated_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
        Schema::dropIfExists('collector_status');
        Schema::dropIfExists('equipment');
        Schema::dropIfExists('alarm_thresholds');
        Schema::dropIfExists('alarms');
        Schema::dropIfExists('registers');
        Schema::dropIfExists('sensor_readings');
    }
};
