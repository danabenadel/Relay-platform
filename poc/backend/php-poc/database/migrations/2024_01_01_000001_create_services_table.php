<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description');
            $table->enum('auth_type', ['oauth2', 'api_key', 'basic']);
            $table->boolean('is_active')->default(true);
            $table->json('config_schema')->nullable();
            $table->timestamps();
            
            $table->index(['name', 'is_active']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('services');
    }
};

