<?php
// routes/api.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ServiceController;

// Route d'accueil
Route::get('/', function () {
    return response()->json([
        'message' => 'POC AREA - PHP Laravel + MySQL',
        'database' => 'MySQL',
        'orm' => 'Eloquent',
        'cache' => 'Redis (ready)',
        'routes' => [
            'POST /api/auth/register' => 'Créer un compte',
            'POST /api/auth/login' => 'Se connecter',
            'GET /api/auth/profile' => 'Voir son profil (protégé)',
            'GET /api/auth/users' => 'Liste des utilisateurs',
            'GET /api/about.json' => 'Info serveur AREA'
        ]
    ]);
});

// Routes d'authentification
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::get('users', [AuthController::class, 'users']);
    
    // Routes protégées
    Route::middleware('jwt.auth')->group(function () {
        Route::get('profile', [AuthController::class, 'profile']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

// Route AREA
Route::get('about.json', [ServiceController::class, 'aboutJson']);

