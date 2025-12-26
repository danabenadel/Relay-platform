<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function users()
    {
        return response()->json([
            'users' => [
                ['id' => 1, 'name' => 'Test User', 'email' => 'test@example.com']
            ]
        ]);
    }

    public function register(Request $request)
    {
        return response()->json(['message' => 'Register endpoint - POC']);
    }

    public function login(Request $request)
    {
        return response()->json(['message' => 'Login endpoint - POC']);
    }
}
