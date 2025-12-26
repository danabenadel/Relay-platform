<?php
// database/migrations/2024_01_01_000006_create_user_services_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            $table->text('access_token')->nullable(); // Encrypted
            $table->text('refresh_token')->nullable(); // Encrypted
            $table->timestamp('expires_at')->nullable();
            $table->json('scopes')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'service_id']);
            $table->index(['user_id', 'service_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_services');
    }
};
