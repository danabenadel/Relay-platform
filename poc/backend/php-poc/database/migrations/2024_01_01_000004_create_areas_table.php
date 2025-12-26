<?php
// database/migrations/2024_01_01_000004_create_areas_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('areas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('action_id')->constrained()->onDelete('restrict');
            $table->json('action_config');
            $table->foreignId('reaction_id')->constrained()->onDelete('restrict');
            $table->json('reaction_config');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['user_id', 'is_active']);
            $table->index(['action_id', 'reaction_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('areas');
    }
};

