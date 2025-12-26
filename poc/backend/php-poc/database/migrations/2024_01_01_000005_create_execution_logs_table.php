<?php
// database/migrations/2024_01_01_000005_create_execution_logs_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('execution_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('area_id')->constrained()->onDelete('cascade');
            $table->timestamp('triggered_at')->useCurrent();
            $table->enum('status', ['success', 'failed', 'pending']);
            $table->json('action_data')->nullable();
            $table->json('reaction_result')->nullable();
            $table->text('error_message')->nullable();
            $table->integer('execution_time_ms')->nullable();
            $table->timestamps();
            
            $table->index(['area_id', 'status', 'triggered_at']);
            $table->index(['triggered_at', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('execution_logs');
    }
};
