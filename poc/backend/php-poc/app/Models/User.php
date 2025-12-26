<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'email',
        'username', 
        'password',
        'is_confirmed'
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'is_confirmed' => 'boolean',
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // JWT Auth methods
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    // Relations
    public function userServices()
    {
        return $this->hasMany(UserService::class);
    }

    public function areas()
    {
        return $this->hasMany(Area::class);
    }
}

