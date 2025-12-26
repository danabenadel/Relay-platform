<?php
// database/seeders/DatabaseSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Service;
use App\Models\Action;
use App\Models\Reaction;
use App\Models\Area;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Clear existing data
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        Area::truncate();
        Reaction::truncate();
        Action::truncate();
        Service::truncate();
        User::truncate();
        
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Create test users
        $testUser = User::create([
            'email' => 'test@example.com',
            'username' => 'testuser',
            'password' => Hash::make('password123'),
            'is_confirmed' => true
        ]);

        $adminUser = User::create([
            'email' => 'admin@area.com',
            'username' => 'admin',
            'password' => Hash::make('password123'),
            'is_confirmed' => true
        ]);

        echo "Created users: {$testUser->email}, {$adminUser->email}\n";

        // Create services
        $gmailService = Service::create([
            'name' => 'gmail',
            'description' => 'Gmail service for email automation',
            'auth_type' => 'oauth2',
            'is_active' => true,
            'config_schema' => [
                'required' => ['client_id', 'client_secret'],
                'properties' => [
                    'client_id' => ['type' => 'string'],
                    'client_secret' => ['type' => 'string']
                ]
            ]
        ]);

        $slackService = Service::create([
            'name' => 'slack',
            'description' => 'Slack service for team communication',
            'auth_type' => 'oauth2',
            'is_active' => true,
            'config_schema' => [
                'required' => ['bot_token'],
                'properties' => [
                    'bot_token' => ['type' => 'string'],
                    'signing_secret' => ['type' => 'string']
                ]
            ]
        ]);

        echo "Created services: {$gmailService->name}, {$slackService->name}\n";

        // Create actions
        $newEmailAction = Action::create([
            'service_id' => $gmailService->id,
            'name' => 'new_email_received',
            'description' => 'Triggered when a new email is received',
            'trigger_type' => 'webhook',
            'config_schema' => [
                'properties' => [
                    'sender_filter' => ['type' => 'string'],
                    'subject_filter' => ['type' => 'string']
                ]
            ]
        ]);

        // Create reactions
        $sendSlackMessage = Reaction::create([
            'service_id' => $slackService->id,
            'name' => 'send_message',
            'description' => 'Send a message to a Slack channel',
            'config_schema' => [
                'required' => ['channel', 'message'],
                'properties' => [
                    'channel' => ['type' => 'string'],
                    'message' => ['type' => 'string']
                ]
            ]
        ]);

        echo "Created action: {$newEmailAction->name}\n";
        echo "Created reaction: {$sendSlackMessage->name}\n";

        // Create test AREA
        $testArea = Area::create([
            'user_id' => $testUser->id,
            'name' => 'Gmail to Slack',
            'description' => 'Send Slack notification when important email arrives',
            'action_id' => $newEmailAction->id,
            'action_config' => [
                'sender_filter' => '@important-client.com',
                'subject_filter' => 'URGENT'
            ],
            'reaction_id' => $sendSlackMessage->id,
            'reaction_config' => [
                'channel' => '#alerts',
                'message' => 'Important email received from {{sender}}: {{subject}}'
            ],
            'is_active' => true
        ]);

        echo "Created AREA: {$testArea->name}\n";

        echo "\nSeeding completed successfully!\n";
        echo "Users count: " . User::count() . "\n";
        echo "Services count: " . Service::count() . "\n";
        echo "Actions count: " . Action::count() . "\n";
        echo "Reactions count: " . Reaction::count() . "\n";
        echo "AREA count: " . Area::count() . "\n";
    }
}

