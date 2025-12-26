
<?php
// app/Models/ExecutionLog.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExecutionLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'area_id',
        'triggered_at',
        'status',
        'action_data',
        'reaction_result',
        'error_message',
        'execution_time_ms'
    ];

    protected $casts = [
        'triggered_at' => 'datetime',
        'action_data' => 'array',
        'reaction_result' => 'array',
        'execution_time_ms' => 'integer'
    ];

    // Relations
    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('triggered_at', '>=', now()->subDays($days));
    }
}

