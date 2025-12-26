<?php
// app/Models/Area.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'action_id',
        'action_config',
        'reaction_id',
        'reaction_config',
        'is_active'
    ];

    protected $casts = [
        'action_config' => 'array',
        'reaction_config' => 'array',
        'is_active' => 'boolean'
    ];

    // Relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function action()
    {
        return $this->belongsTo(Action::class);
    }

    public function reaction()
    {
        return $this->belongsTo(Reaction::class);
    }

    public function executionLogs()
    {
        return $this->hasMany(ExecutionLog::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
