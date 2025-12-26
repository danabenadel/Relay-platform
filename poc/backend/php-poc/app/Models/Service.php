<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'auth_type',
        'is_active',
        'config_schema'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'config_schema' => 'array'
    ];

    // Relations
    public function actions()
    {
        return $this->hasMany(Action::class);
    }

    public function reactions()
    {
        return $this->hasMany(Reaction::class);
    }

    public function userServices()
    {
        return $this->hasMany(UserService::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

