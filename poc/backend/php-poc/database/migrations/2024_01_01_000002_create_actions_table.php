<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description');
            $table->json('config_schema')->nullable();
            $table->enum('trigger_type', ['webhook', 'polling', 'scheduled']);
            $table->timestamps();
            
            $table->unique(['service_id', 'name']);
            $table->index(['service_id', 'trigger_type']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('actions');
    }
};

