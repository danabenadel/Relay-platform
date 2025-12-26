<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function aboutJson(Request $request)
    {
        return response()->json([
            "client" => [
                "host" => $request->ip()
            ],
            "server" => [
                "current_time" => time(),
                "services" => [
                    [
                        "name" => "facebook",
                        "actions" => [
                            [
                                "name" => "new_message_in_group",
                                "description" => "A new message is posted in the group"
                            ]
                        ],
                        "reactions" => [
                            [
                                "name" => "like_message", 
                                "description" => "The user likes a message"
                            ]
                        ]
                    ]
                ]
            ]
        ]);
    }
}