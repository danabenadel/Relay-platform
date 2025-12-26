<?php
// database/migrations/2024_01_01_000003_create_reactions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description');
            $table->json('config_schema')->nullable();
            $table->timestamps();
            
            $table->unique(['service_id', 'name']);
            $table->index('service_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('reactions');
    }
};
