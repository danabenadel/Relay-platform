<?php
// app/Models/Action.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Action extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'name',
        'description',
        'config_schema',
        'trigger_type'
    ];

    protected $casts = [
        'config_schema' => 'array'
    ];

    // Relations
    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function areas()
    {
        return $this->hasMany(Area::class);
    }
}

