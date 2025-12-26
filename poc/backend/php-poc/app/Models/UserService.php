
<?php
// app/Models/UserService.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserService extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'service_id',
        'access_token',
        'refresh_token',
        'expires_at',
        'scopes'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'scopes' => 'array'
    ];

    protected $hidden = [
        'access_token',
        'refresh_token'
    ];

    // Relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    // Accessors/Mutators pour l'encryption
    public function setAccessTokenAttribute($value)
    {
        $this->attributes['access_token'] = $value ? encrypt($value) : null;
    }

    public function getAccessTokenAttribute($value)
    {
        return $value ? decrypt($value) : null;
    }

    public function setRefreshTokenAttribute($value)
    {
        $this->attributes['refresh_token'] = $value ? encrypt($value) : null;
    }

    public function getRefreshTokenAttribute($value)
    {
        return $value ? decrypt($value) : null;
    }
}
