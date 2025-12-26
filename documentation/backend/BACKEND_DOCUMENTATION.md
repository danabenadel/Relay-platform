# AREA Backend - Technical Documentation

## Table of Contents

1. [General Architecture](#general-architecture)
2. [Services and Ports](#services-and-ports)
3. [Project Structure](#project-structure)
4. [API Routes](#api-routes)
5. [Microservices](#microservices)
6. [Database](#database)
7. [Authentication and Security](#authentication-and-security)
8. [Environment Variables](#environment-variables)
9. [Development](#development)

---

## General Architecture

The AREA backend follows a **microservices architecture** with a main server that orchestrates the different services.

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Client                         │
│                    (Nuxt.js - Port 8081)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Main Backend                              │
│                  (Express.js - Port 8080)                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │  • JWT Authentication                              │     │
│  │  • AREA Management                                 │     │
│  │  • OAuth (Google, GitHub, Facebook, etc.)          │     │
│  │  • Routing to microservices                        │     │
│  └────────────────────────────────────────────────────┘     │
└──────────────────────────┬──────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Microservices│  │ Microservices│  │ Microservices│
│   Internal   │  │    OAuth     │  │     API      │
└──────────────┘  └──────────────┘  └──────────────┘
         │                 │                 │
         ▼                 ▼                 ▼
   PostgreSQL      External Services    OpenAI API
   (Port 5433)    (Google, GitHub...)   (GPT-3.5/4)
```

---

## Services and Ports

| Service | Port | Type | Description |
|---------|------|------|-------------|
| **Main Backend** | 8080 | REST API | Main Express.js server |
| **Frontend** | 8081 | Web | Nuxt.js application |
| **PostgreSQL** | 5433 | Database | Main database |
| **Timer Service** | 5001 | Microservice | Time-based trigger management |
| **Google Service** | 5002 | Microservice | Gmail & Google Drive |
| **Discord Service** | 5003 | Microservice | Discord webhooks and actions |
| **Spotify Service** | 5004 | Microservice | Spotify API integration |
| **Reddit Service** | 5005 | Microservice | Reddit actions and reactions |
| **GitHub Service** | 5006 | Microservice | GitHub management (issues, PRs, etc.) |
| **OpenAI Service** | 5007 | Microservice | Generative AI (GPT-3.5/4) |
| **YouTube Service** | 5008 | Microservice | YouTube channel monitoring and automation |
| **Telegram Service** | 5009 | Microservice | Telegram bot interactions and moderation |
| **OneDrive Service** | 5010 | Microservice | Microsoft OneDrive |
| **GitLab Service** | 5013 | Microservice | GitLab issues and merge requests |
| **Notion Service** | 5014 | Microservice | Notion workspace automation |

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Prisma configuration
│   │   └── env.ts                # Environment variable validation
│   ├── controllers/
│   │   └── AuthController.ts     # Authentication logic
│   ├── middleware/
│   │   ├── auth.ts               # JWT authentication
│   │   ├── rateLimiter.ts        # Rate limiting
│   │   └── validation.ts         # Data validation
│   ├── routes/
│   │   ├── Auth.Routes.ts        # Authentication routes
│   │   └── Area.Routes.ts        # AREA management routes
│   ├── services/
│   │   ├── AuthService.ts        # Authentication service
│   │   ├── oauth.service.ts      # OAuth management
│   │   ├── spotify.token.service.ts
│   │   ├── reddit.token.service.ts
│   │   ├── discord.token.service.ts
│   │   ├── github.token.service.ts
│   │   └── onedrive.token.service.ts
│   ├── repositories/
│   │   └── UserRepository.ts     # User data access
│   ├── utils/
│   │   ├── encryption.ts         # AES-256 encryption
│   │   ├── csrf.ts               # CSRF protection
│   │   └── validation.ts         # Validation utilities
│   ├── types/
│   │   ├── auth.ts               # TypeScript auth types
│   │   └── common.ts             # Common types
│   └── index.ts                  # Main entry point
│
├── microservices/
│   ├── timer/
│   │   ├── index.ts              # Timer service (cron jobs)
│   │   └── Dockerfile
│   ├── discord/
│   │   ├── index.ts              # Discord webhooks
│   │   └── Dockerfile
│   ├── spotify/
│   │   ├── index.ts              # Spotify API
│   │   └── Dockerfile
│   ├── google/
│   │   ├── index.ts              # Gmail & Drive
│   │   ├── actions/              # Actions (triggers)
│   │   ├── reactions/            # Reactions
│   │   └── Dockerfile
│   ├── reddit/
│   │   ├── index.ts              # Reddit API
│   │   └── Dockerfile
│   ├── github/
│   │   ├── index.ts              # GitHub API
│   │   └── Dockerfile
│   ├── openai/
│   │   ├── index.ts              # OpenAI GPT-3.5/4
│   │   └── Dockerfile
│   └── onedrive/
│       ├── index.ts              # Microsoft OneDrive
│       └── Dockerfile
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # SQL migrations
│
├── keys/
│   ├── private.key               # RSA private key for JWT
│   └── public.key                # RSA public key for JWT
│
├── swagger.yaml                  # Swagger API documentation
├── Dockerfile                    # Main backend Docker image
├── package.json
└── tsconfig.json
```

---

## API Routes

### Main Backend (Port 8080)

#### Public Endpoints

##### GET `/health`

Server health check.

**Response (200 OK)**
```json
{
  "status": "OK",
  "timestamp": "2025-10-30T15:30:00.000Z",
  "service": "AREA Backend"
}
```

##### GET `/about.json`

Information about available services (IFTTT-like format).

**Response (200 OK)**
```json
{
  "client": {
    "host": "::ffff:172.18.0.1"
  },
  "server": {
    "current_time": 1761836666,
    "services": [
      {
        "name": "timer",
        "type": "internal",
        "description": "Timer service for scheduled actions",
        "actions": [
          {
            "name": "timer_time",
            "description": "Triggers at a specific time (HH:MM)"
          }
        ],
        "reactions": []
      }
      // ... other services
    ]
  }
}
```

##### GET `/api-docs`

Interactive Swagger UI documentation.

---

#### Authentication (`/auth`)

##### POST `/auth/register`

Register a new user.

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "cmh9mi9820000o84ntkylxpik",
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Codes**
- `400`: Invalid data (email already used, weak password)
- `500`: Server error

##### POST `/auth/login`

User login.

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cmh9mi9820000o84ntkylxpik",
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Codes**
- `401`: Incorrect email or password
- `500`: Server error

##### POST `/auth/refresh`

Refresh JWT token.

**Required Headers**
```
Authorization: Bearer <old_token>
```

**Response (200 OK)**
```json
{
  "success": true,
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Codes**
- `401`: Invalid or expired token
- `500`: Server error

##### GET `/auth/me`

Get logged-in user information.

**Required Headers**
```
Authorization: Bearer <token>
```

**Response (200 OK)**
```json
{
  "success": true,
  "user": {
    "id": "cmh9mi9820000o84ntkylxpik",
    "email": "user@example.com",
    "createdAt": "2025-10-15T10:00:00.000Z"
  }
}
```

**Error Codes**
- `401`: Not authenticated
- `500`: Server error

##### POST `/auth/logout`

User logout.

**Required Headers**
```
Authorization: Bearer <token>
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Error Codes**
- `401`: Not authenticated
- `500`: Server error

#### OAuth (`/auth/oauth`)

| Provider | Endpoints |
|----------|-----------|
| Google | `/auth/oauth/google` → `/auth/oauth/google/callback` |
| GitHub | `/auth/oauth/github` → `/auth/oauth/github/callback` |
| Facebook | `/auth/oauth/facebook` → `/auth/oauth/facebook/callback` |
| Spotify | `/auth/oauth/spotify` → `/auth/oauth/spotify/callback` |
| Reddit | `/auth/oauth/reddit` → `/auth/oauth/reddit/callback` |
| Discord | `/auth/oauth/discord` → `/auth/oauth/discord/callback` |
| OneDrive | `/auth/oauth/onedrive` → `/auth/oauth/onedrive/callback` |

#### AREA Management (`/api/areas`)

All AREA routes require JWT authentication.

**Required Headers**
```
Authorization: Bearer <token>
```

##### GET `/api/areas`

List all user's AREAs.

**Response (200 OK)**
```json
{
  "success": true,
  "areas": [
    {
      "id": 278,
      "userId": "cmh9mi9820000o84ntkylxpik",
      "isActive": true,
      "lastTriggeredAt": "2025-10-30T15:26:45.253Z",
      "createdAt": "2025-10-30T14:00:00.000Z",
      "action": {
        "id": 1,
        "name": "timer_time",
        "description": "Triggers at a specific time",
        "service": {
          "name": "timer",
          "type": "internal"
        }
      },
      "reaction": {
        "id": 26,
        "name": "generate_text",
        "description": "Generate creative text using GPT",
        "service": {
          "name": "openai",
          "type": "api"
        }
      },
      "config": {
        "targetTime": "16:30",
        "prompt": "Write a short story"
      }
    }
  ]
}
```

**Error Codes**
- `401`: Not authenticated
- `500`: Server error

##### POST `/api/areas`

Create a new AREA (Action → Reaction association).

**Request Body**
```json
{
  "actionId": 1,
  "reactionId": 26,
  "config": {
    "targetTime": "16:30",
    "prompt": "Write a motivational quote",
    "model": "gpt-3.5-turbo",
    "maxTokens": 100
  }
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "message": "AREA created successfully",
  "area": {
    "id": 285,
    "userId": "cmh9mi9820000o84ntkylxpik",
    "actionId": 1,
    "reactionId": 26,
    "isActive": true,
    "config": { /* ... */ },
    "createdAt": "2025-10-30T15:30:00.000Z"
  }
}
```

**Error Codes**
- `400`: Invalid data (incorrect actionId or reactionId)
- `401`: Not authenticated
- `500`: Server error

##### GET `/api/areas/:id`

Get specific AREA details.

**URL Parameters**
- `id`: AREA ID

**Response (200 OK)**
```json
{
  "success": true,
  "area": {
    "id": 278,
    "userId": "cmh9mi9820000o84ntkylxpik",
    "isActive": true,
    "config": { /* ... */ },
    "action": { /* ... */ },
    "reaction": { /* ... */ }
  }
}
```

**Error Codes**
- `401`: Not authenticated
- `404`: AREA not found
- `500`: Server error

##### PATCH `/api/areas/:id`

Enable or disable an AREA.

**Request Body**
```json
{
  "isActive": false
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "AREA updated successfully",
  "area": {
    "id": 278,
    "isActive": false
  }
}
```

**Error Codes**
- `400`: Invalid data
- `401`: Not authenticated
- `404`: AREA not found
- `500`: Server error

##### DELETE `/api/areas/:id`

Delete an AREA permanently.

**Response (200 OK)**
```json
{
  "success": true,
  "message": "AREA deleted successfully"
}
```

**Error Codes**
- `401`: Not authenticated
- `404`: AREA not found
- `500`: Server error

##### GET `/api/areas/services`

List all available services with their actions and reactions.

**Response (200 OK)**
```json
{
  "success": true,
  "services": [
    {
      "id": 1,
      "name": "timer",
      "description": "Timer service",
      "type": "internal",
      "actions": [
        {
          "id": 1,
          "name": "timer_time",
          "description": "Triggers at specific time"
        }
      ],
      "reactions": []
    },
    {
      "id": 8,
      "name": "openai",
      "description": "OpenAI GPT service",
      "type": "api",
      "actions": [],
      "reactions": [
        {
          "id": 26,
          "name": "generate_text",
          "description": "Generate creative text"
        }
      ]
    }
  ]
}
```

**Error Codes**
- `401`: Not authenticated
- `500`: Server error

##### POST `/api/areas/trigger/:id`

Manually trigger an AREA (for testing).

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Reaction executed successfully",
  "data": {
    "text": "Here is your generated content...",
    "model": "gpt-3.5-turbo-0125",
    "usage": {
      "total_tokens": 457
    }
  }
}
```

**Error Codes**
- `401`: Not authenticated
- `404`: AREA not found
- `501`: Reaction not implemented
- `503`: External service unavailable
- `500`: Server error

---

## Microservices

### 1. Timer Service (Port 5001)

**Type**: Internal
**Technology**: Node.js + node-cron

#### Features
- Time-based triggers (specific time)
- Date-based triggers
- Multiple simultaneous timers management

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/start` | Start a timer |
| POST | `/stop` | Stop a timer |

#### Available Actions
- `timer_time`: Triggers at a specific time (HH:MM)
- `timer_date`: Triggers at a specific date (DD/MM)

---

### 2. Google Service (Port 5002)

**Type**: OAuth
**Technology**: Node.js + Google APIs

#### Features
- Gmail (reading and sending emails)
- Google Drive (file management)

#### Actions (Triggers)
- `google_new_email_received`: New email received
- `google_email_from_sender`: Email from specific sender
- `google_email_with_attachment`: Email with attachment
- `google_new_drive_file`: New file on Drive

#### Reactions
- `google_send_email`: Send an email
- `google_reply_to_email`: Reply to an email
- `google_save_attachment_to_drive`: Save attachment to Drive

---

### 3. Discord Service (Port 5003)

**Type**: Internal
**Technology**: Node.js + Discord.js

#### Actions (Triggers)
- `new_message_in_channel`: Message in a channel
- `new_member_joined`: New member
- `message_reaction_added`: Reaction added

#### Reactions
- `discord_webhook`: Send message via webhook
- `send_message`: Send text message
- `send_embed`: Send rich embed
- `send_dm`: Send direct message
- `add_reaction`: Add emoji reaction
- `delete_message`: Delete message
- `pin_message`: Pin message

---

### 4. Spotify Service (Port 5004)

**Type**: OAuth
**Technology**: Node.js + Spotify Web API

#### Actions (Triggers)
- `new_track_in_playlist`: New track in playlist
- `new_saved_track`: New saved track
- `song_playing`: Song currently playing
- `playlist_updated`: Playlist modified

#### Reactions
- `play_track`: Play a track
- `add_to_playlist`: Add to playlist
- `create_playlist`: Create a playlist
- `save_track`: Save a track
- `pause_playback`: Pause playback
- `resume_playback`: Resume playback
- `next_track`: Next track
- `previous_track`: Previous track
- `set_volume`: Set volume
- `shuffle_toggle`: Toggle shuffle

---

### 5. Reddit Service (Port 5005)

**Type**: OAuth
**Technology**: Node.js + Snoowrap

#### Actions (Triggers)
- `new_comment_on_post`: New comment
- `new_message`: New private message
- `post_score_threshold`: Score threshold reached
- `user_mentioned`: User mention
- `new_subscriber_milestone`: Subscriber count reached
- `new_post_in_subreddit`: New post in subreddit

#### Reactions
- `submit_post`: Create a post
- `submit_comment`: Post a comment
- `upvote`: Upvote
- `downvote`: Downvote
- `save_post`: Save a post
- `subscribe_subreddit`: Subscribe
- `unsubscribe_subreddit`: Unsubscribe
- `send_message`: Send private message
- `edit_user_flair`: Edit flair
- `report_content`: Report content

---

### 6. GitHub Service (Port 5006)

**Type**: OAuth
**Technology**: Node.js + Octokit

#### Actions (Triggers)
- `new_issue`: New issue
- `new_pull_request`: New pull request
- `pull_request_merged`: PR merged
- `new_star`: New star
- `new_commit`: New commit
- `new_release`: New release

#### Reactions
- `create_issue`: Create an issue
- `create_comment`: Comment
- `star_repository`: Star repository
- `create_branch`: Create branch
- `close_issue`: Close issue
- `add_label`: Add label

---

### 7. OpenAI Service (Port 5007)

**Type**: API
**Technology**: Node.js + OpenAI SDK

#### Supported Models
- GPT-3.5-turbo (fast and economical)
- GPT-4 (advanced, better quality)

#### Reactions (8 available)

1. **`generate_text`**: Creative text generation
   - Parameters: `prompt`, `model`, `maxTokens`, `temperature`

2. **`summarize_text`**: Automatic summarization
   - Parameters: `text`, `maxLength`

3. **`translate_text`**: Multilingual translation
   - Parameters: `text`, `sourceLanguage`, `targetLanguage`

4. **`answer_question`**: Question answering
   - Parameters: `question`, `context` (optional)

5. **`code_review`**: AI code review
   - Parameters: `code`, `language`

6. **`generate_creative`**: Creative content
   - Types: `poem`, `story`, `email`, `joke`, `slogan`
   - Parameters: `type`, `topic`

7. **`explain_concept`**: Educational explanation
   - Levels: `child`, `teen`, `adult`, `expert`
   - Parameters: `concept`, `level`

8. **`generate_ideas`**: Idea brainstorming
   - Parameters: `topic`, `count`

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check + API status |
| POST | `/reactions/trigger` | Trigger OpenAI reaction |

---

### 8. YouTube Service (Port 5008)

**Type**: OAuth (Google)
**Technology**: Node.js + YouTube Data API v3

#### Highlights
- Built-in polling coordinator with safe refresh-token handling
- Filters for keywords, duration, channel and livestream metadata

#### Actions (Triggers)
- `youtube_new_video_uploaded`: New video published on a channel (duration/shorts filters)
- `youtube_new_comment`: New comment on a tracked video (keyword and author filters)
- `youtube_new_subscriber`: Authenticated user subscribes to a new channel (optional channel filter)
- `youtube_video_liked`: Authenticated user likes a video (channel and category filters)
- `youtube_livestream_started`: Channel starts a livestream (title keyword filters)

#### Reactions
- `youtube_post_comment`: Post a comment on a video (template variables supported)
- `youtube_like_video`: Like a video
- `youtube_add_to_playlist`: Add a video to a playlist
- `youtube_create_playlist`: Create a playlist with metadata and privacy options
- `youtube_subscribe_channel`: Subscribe to a channel (template-aware)

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check + active polling jobs |
| POST | `/polling/start` | Start polling for a YouTube action |
| POST | `/polling/stop` | Stop polling for a YouTube action |
| POST | `/reactions/trigger` | Execute a YouTube reaction |

---

### 9. Telegram Service (Port 5009)

**Type**: API
**Technology**: Node.js + Telegram Bot API

#### Actions (Triggers)
- `new_message`: New message in a chat (supports chat, text, and media filters)
- `new_member`: New member joins a chat
- `bot_command`: Bot command invoked (with optional command filter)
- `channel_post`: Post published in a channel
- `poll_created`: Poll created in a chat or channel

#### Reactions
- `send_message`: Send a text message (Markdown/HTML supported)
- `send_photo`: Send a photo with optional caption
- `send_document`: Send any document/file
- `create_poll`: Publish a poll
- `pin_message`: Pin a message in a chat
- `kick_user`: Remove a user from a chat

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/actions/start` | Start polling for an action |
| POST | `/actions/stop` | Stop polling for an action |
| POST | `/reactions/trigger` | Execute a Telegram reaction |

---

### 10. OneDrive Service (Port 5010)

**Type**: OAuth
**Technology**: Node.js + Microsoft Graph API

#### Actions (Triggers)
- `new_file_in_folder`: New file
- `new_photo_in_folder`: New photo

#### Reactions
- `create_text_file`: Create text file
- `append_to_text_file`: Append text
- `add_file_from_url`: Download from URL (30MB limit)

---

### 11. GitLab Service (Port 5013)

**Type**: OAuth
**Technology**: Node.js + GitLab REST API v4

#### Actions (Triggers)
- `new_issue`: Detects a freshly created issue (last 2 minutes) in a project
- `new_merge_request`: Detects a newly opened merge request
- `merge_request_merged`: Detects a merge request merged into target branch

#### Reactions
- `create_issue`: Create an issue (labels and assignees supported)
- `comment_merge_request`: Comment on an existing merge request
- `add_label`: Add labels to an issue
- `close_issue`: Close an existing issue

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/auth/gitlab/callback` | OAuth callback proxy |
| POST | `/auth/gitlab/refresh` | Refresh GitLab tokens |
| POST | `/actions/check` | Evaluate an action trigger once |
| POST | `/reactions/trigger` | Execute a GitLab reaction |

---

### 12. Notion Service (Port 5014)

**Type**: OAuth
**Technology**: Node.js + Notion API

#### Actions (Triggers)
- `notion_new_page_created`: New page created under a parent
- `notion_database_entry_added`: New database entry created
- `notion_page_updated`: Existing page updated

#### Reactions
- `notion_create_page`: Create a page under a database or page (JSON templates supported)
- `notion_database_add_entry`: Insert a database entry with templated properties
- `notion_update_page`: Update properties of an existing page

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check + active jobs |
| POST | `/auth/notion/callback` | Proxy to backend OAuth callback |
| POST | `/actions/start` | Start polling for an action |
| POST | `/actions/stop` | Stop polling |
| POST | `/reactions/trigger` | Execute a Notion reaction |

---

## Database

### Technology
- **PostgreSQL 14**
- **ORM**: Prisma

### Main Tables

#### `users`
Stores user information.

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String    // Hashed with bcrypt
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  areas         Area[]
  oAuthTokens   OAuthToken[]
}
```

#### `services`
List of available services (Timer, Discord, Spotify, etc.).

```prisma
model Service {
  id          Int       @id @default(autoincrement())
  name        String    @unique
  description String
  type        String    // "internal", "oauth", "api"
  actions     Action[]
  reactions   Reaction[]
}
```

#### `actions`
Available triggers for each service.

```prisma
model Action {
  id          Int       @id @default(autoincrement())
  name        String
  description String
  serviceId   Int
  service     Service   @relation(fields: [serviceId], references: [id])
  areas       Area[]
}
```

#### `reactions`
Possible reactions for each service.

```prisma
model Reaction {
  id          Int       @id @default(autoincrement())
  name        String
  description String
  serviceId   Int
  service     Service   @relation(fields: [serviceId], references: [id])
  areas       Area[]
}
```

#### `areas`
Action → Reaction associations created by users.

```prisma
model Area {
  id              Int       @id @default(autoincrement())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  actionId        Int
  action          Action    @relation(fields: [actionId], references: [id])
  reactionId      Int
  reaction        Reaction  @relation(fields: [reactionId], references: [id])
  config          Json      // Specific configuration
  isActive        Boolean   @default(true)
  lastTriggeredAt DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

#### `oAuthTokens`
User OAuth tokens for external services.

```prisma
model OAuthToken {
  id           String    @id @default(cuid())
  userId       String
  user         User      @relation(fields: [userId], references: [id])
  serviceName  String    // "google", "spotify", etc.
  accessToken  String    // Encrypted with AES-256
  refreshToken String?   // Encrypted with AES-256
  expiresAt    DateTime
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}
```

---

## Authentication and Security

### JWT (JSON Web Tokens)

The backend uses **RSA-signed JWT tokens** (private/public keys).

#### Token Structure
```json
{
  "userId": "cmh9mi9820000o84ntkylxpik",
  "email": "user@example.com",
  "iat": 1698765432,
  "exp": 1698851832
}
```

#### Generation
- RSA private key: `keys/private.key`
- RSA public key: `keys/public.key`
- Lifetime: 24 hours

### CSRF Protection

Protection against CSRF attacks with tokens.

```typescript
// Can be disabled in development
DISABLE_CSRF=true  // .env
```

### Rate Limiting

Request rate limiting per IP:
- **Global**: 100 requests / 15 minutes
- **Auth routes**: 10 requests / 15 minutes

### Encryption

OAuth tokens are encrypted in AES-256-CBC before database storage.

```typescript
// Encryption key in .env
ENCRYPTION_KEY=your-32-character-encryption-key
```

### CORS

Strict CORS configuration:
- Origin whitelist: `FRONTEND_URL` from `.env`
- Credentials: enabled
- Allowed methods: GET, POST, PUT, DELETE, PATCH, OPTIONS

---

## Environment Variables

### `.env` File (Main Backend)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/area_db

# Server
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:8081

# Security
DISABLE_CSRF=true  # Dev only
ENCRYPTION_KEY=your-32-character-encryption-key

# JWT Keys (RSA)
# Generate with: ssh-keygen -t rsa -b 4096 -m PEM -f keys/private.key

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8080/auth/oauth/google/callback

# OAuth - GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:8080/auth/oauth/github/callback

# OAuth - Facebook
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=http://localhost:8080/auth/oauth/facebook/callback

# OAuth - Spotify
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SPOTIFY_REDIRECT_URI=http://localhost:8080/auth/oauth/spotify/callback

# OAuth - Reddit
REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_CLIENT_SECRET=your-reddit-client-secret
REDDIT_REDIRECT_URI=http://localhost:8080/auth/oauth/reddit/callback

# OAuth - Discord
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
DISCORD_BOT_TOKEN=your-discord-bot-token
DISCORD_REDIRECT_URI=http://localhost:8080/auth/oauth/discord/callback

# OAuth - OneDrive (Microsoft Azure AD)
ONEDRIVE_CLIENT_ID=your-azure-app-client-id
ONEDRIVE_CLIENT_SECRET=your-azure-app-client-secret
ONEDRIVE_REDIRECT_URI=http://localhost:8080/auth/oauth/onedrive/callback

# OAuth - GitLab
GITLAB_CLIENT_ID=your-gitlab-application-id
GITLAB_CLIENT_SECRET=your-gitlab-application-secret
GITLAB_REDIRECT_URI=http://localhost:8080/auth/oauth/gitlab/callback

# OAuth - Notion
NOTION_CLIENT_ID=your-notion-integration-id
NOTION_CLIENT_SECRET=your-notion-integration-secret
NOTION_REDIRECT_URI=http://localhost:8080/auth/oauth/notion/callback

# Microservices URLs
TIMER_SERVICE_URL=http://localhost:5001
GOOGLE_SERVICE_URL=http://localhost:5002
DISCORD_SERVICE_URL=http://localhost:5003
SPOTIFY_SERVICE_URL=http://localhost:5004
REDDIT_SERVICE_URL=http://localhost:5005
GITHUB_SERVICE_URL=http://localhost:5006
OPENAI_SERVICE_URL=http://localhost:5007
YOUTUBE_SERVICE_URL=http://localhost:5008
TELEGRAM_SERVICE_URL=http://localhost:5009
ONEDRIVE_SERVICE_URL=http://localhost:5010
GITLAB_SERVICE_URL=http://localhost:5013
NOTION_SERVICE_URL=http://localhost:5014

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key
```

---

## Development

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14
- OpenAI account (for AI service)

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your values
```

4. **Generate RSA keys for JWT**
```bash
mkdir -p keys
ssh-keygen -t rsa -b 4096 -m PEM -f keys/private.key -N ""
openssl rsa -in keys/private.key -pubout -outform PEM -out keys/public.key
```

5. **Initialize the database**
```bash
npx prisma migrate dev
npx prisma db seed  # (if seed available)
```

6. **Start with Docker**
```bash
docker compose up --build
```

### Useful Commands

```bash
# Rebuild a specific service
docker compose up -d --build server

# View service logs
docker logs area_server -f

# Access the database
docker exec -it area_database psql -U area_user -d area_db

# Generate Prisma client after schema modification
npx prisma generate

# Create a migration
npx prisma migrate dev --name migration_name

# Format code
npm run format  # (if configured)
```

### Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage
npm run test:coverage
```

### Swagger UI

Interactive documentation available at:
```
http://localhost:8080/api-docs
```

---

## Production Deployment

### Pre-Deployment Checklist

Before deploying to production, make sure to:

- [ ] Configure all environment variables
- [ ] Generate secure RSA keys for JWT
- [ ] Define a strong encryption key (`ENCRYPTION_KEY`)
- [ ] Configure all OAuth providers with correct callback URLs
- [ ] Have a production-ready PostgreSQL database
- [ ] Have a domain name and SSL/TLS certificate
- [ ] Enable CSRF protection (`DISABLE_CSRF=false`)
- [ ] Configure appropriate rate limiting
- [ ] Test all integrations in staging environment

### Recommended Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                Load Balancer / Reverse Proxy         │
│                   (Nginx / Traefik)                  │
│                   SSL/TLS Termination                │
└──────────────────────┬──────────────────────────────┘
                       │
         ┌─────────────┼─────────────────┐
         ▼             ▼                 ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Backend     │ │  Frontend    │ │ Microservices│
│  (Port 8080) │ │  (Port 8081) │ │ (Ports 500X) │
└──────┬───────┘ └──────────────┘ └──────┬───────┘
       │                                  │
       └──────────────┬───────────────────┘
                      ▼
              ┌──────────────┐
              │  PostgreSQL  │
              │  (Managed)   │
              └──────────────┘
```

### Option 1: Deployment with Docker Compose

#### Step 1: Prepare docker-compose.prod.yml file

```yaml
services:
  database:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
    restart: always
    networks:
      - area-network-prod

  server:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - FRONTEND_URL=${FRONTEND_URL}
      - DISABLE_CSRF=false
    restart: always
    depends_on:
      - database
    networks:
      - area-network-prod

  # Repeat for each microservice...

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - server
    restart: always
    networks:
      - area-network-prod

volumes:
  postgres_data_prod:

networks:
  area-network-prod:
    driver: bridge
```

#### Step 2: Create production-optimized Dockerfile

```dockerfile
# backend/Dockerfile.prod
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma/ ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

COPY src/ ./src/
COPY keys/ ./keys/
COPY swagger.yaml ./swagger.yaml

RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/keys ./keys
COPY --from=builder /app/swagger.yaml ./swagger.yaml
COPY --from=builder /app/package*.json ./

# Security: non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 8080
CMD ["node", "dist/index.js"]
```

#### Step 3: Nginx configuration with SSL

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server server:8080;
    }

    upstream frontend {
        server client_web:8081;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Backend API
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /auth/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

#### Step 4: Production environment variables

Create a `.env.production` file:

```bash
# IMPORTANT: Never commit this file!

NODE_ENV=production
PORT=8080
FRONTEND_URL=https://yourdomain.com

# Database (use managed DB if possible)
DATABASE_URL=postgresql://prod_user:STRONG_PASSWORD@db-host:5432/area_prod

# Security
DISABLE_CSRF=false
ENCRYPTION_KEY=GENERATE_A_STRONG_32_CHAR_KEY_HERE

# JWT (generate new keys for prod)
# ssh-keygen -t rsa -b 4096 -m PEM -f keys/private.key -N ""

# OAuth - HTTPS callback URLs
GOOGLE_CLIENT_ID=prod-google-client-id
GOOGLE_CLIENT_SECRET=prod-google-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/oauth/google/callback

GITHUB_CLIENT_ID=prod-github-client-id
GITHUB_CLIENT_SECRET=prod-github-secret
GITHUB_REDIRECT_URI=https://yourdomain.com/auth/oauth/github/callback

SPOTIFY_CLIENT_ID=prod-spotify-client-id
SPOTIFY_CLIENT_SECRET=prod-spotify-secret
SPOTIFY_REDIRECT_URI=https://yourdomain.com/auth/oauth/spotify/callback

REDDIT_CLIENT_ID=prod-reddit-client-id
REDDIT_CLIENT_SECRET=prod-reddit-secret
REDDIT_REDIRECT_URI=https://yourdomain.com/auth/oauth/reddit/callback

DISCORD_CLIENT_ID=prod-discord-client-id
DISCORD_CLIENT_SECRET=prod-discord-secret
DISCORD_REDIRECT_URI=https://yourdomain.com/auth/oauth/discord/callback

ONEDRIVE_CLIENT_ID=prod-onedrive-client-id
ONEDRIVE_CLIENT_SECRET=prod-onedrive-secret
ONEDRIVE_REDIRECT_URI=https://yourdomain.com/auth/oauth/onedrive/callback

GITLAB_CLIENT_ID=prod-gitlab-client-id
GITLAB_CLIENT_SECRET=prod-gitlab-secret
GITLAB_REDIRECT_URI=https://yourdomain.com/auth/oauth/gitlab/callback

NOTION_CLIENT_ID=prod-notion-client-id
NOTION_CLIENT_SECRET=prod-notion-secret
NOTION_REDIRECT_URI=https://yourdomain.com/auth/oauth/notion/callback

# Microservices (Docker container names)
TIMER_SERVICE_URL=http://area_timer_service:5001
GOOGLE_SERVICE_URL=http://area_google_service:5002
DISCORD_SERVICE_URL=http://area_discord_service:5003
SPOTIFY_SERVICE_URL=http://area_spotify_service:5004
REDDIT_SERVICE_URL=http://area_reddit_service:5005
GITHUB_SERVICE_URL=http://area_github_service:5006
OPENAI_SERVICE_URL=http://area_openai_service:5007
YOUTUBE_SERVICE_URL=http://area_youtube_service:5008
TELEGRAM_SERVICE_URL=http://area_telegram_service:5009
ONEDRIVE_SERVICE_URL=http://area_onedrive_service:5010
GITLAB_SERVICE_URL=http://area_gitlab_service:5013
NOTION_SERVICE_URL=http://area_notion_service:5014

# OpenAI
OPENAI_API_KEY=sk-prod-your-real-key
```

#### Step 5: Deploy

```bash
# 1. Copy files to server
scp -r . user@server:/opt/area/

# 2. Connect to server
ssh user@server

# 3. Go to directory
cd /opt/area

# 4. Load environment variables
cp .env.production .env

# 5. Generate JWT keys (if not already done)
mkdir -p backend/keys
ssh-keygen -t rsa -b 4096 -m PEM -f backend/keys/private.key -N ""
openssl rsa -in backend/keys/private.key -pubout -outform PEM -out backend/keys/public.key

# 6. Build images
docker compose -f docker-compose.prod.yml build

# 7. Run database migrations
docker compose -f docker-compose.prod.yml run --rm server npx prisma migrate deploy

# 8. Start all services
docker compose -f docker-compose.prod.yml up -d

# 9. Verify everything works
docker compose -f docker-compose.prod.yml ps
docker logs area_server

# 10. Test
curl https://yourdomain.com/health
```

### Option 2: Cloud Deployment (AWS, GCP, Azure)

#### Recommended Components

1. **Database**
   - AWS RDS PostgreSQL
   - Google Cloud SQL
   - Azure Database for PostgreSQL

2. **Container Orchestration**
   - AWS ECS/Fargate
   - Google Cloud Run / GKE
   - Azure Container Instances / AKS

3. **Load Balancer**
   - AWS ALB (Application Load Balancer)
   - Google Cloud Load Balancing
   - Azure Load Balancer

4. **Secret Storage**
   - AWS Secrets Manager
   - Google Secret Manager
   - Azure Key Vault

#### Example: Deployment on AWS ECS

```yaml
# task-definition.json
{
  "family": "area-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-ecr-repo/area-backend:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:area/database-url"
        },
        {
          "name": "OPENAI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:area/openai-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/area-backend",
          "awslogs-region": "eu-west-1",
          "awslogs-stream-prefix": "backend"
        }
      }
    }
  ]
}
```

### Deployment Best Practices

#### 1. Security

- ✅ Use HTTPS everywhere (Let's Encrypt for free SSL)
- ✅ Never expose microservice ports directly
- ✅ Use secrets managers for API keys
- ✅ Enable CSRF protection in production
- ✅ Configure appropriate rate limits
- ✅ Restrict CORS origins to authorized domains only
- ✅ Use strong passwords for database
- ✅ Encrypt OAuth tokens in database (already done with AES-256)
- ✅ Regularly update npm dependencies

#### 2. Monitoring and Logs

```bash
# Centralize logs with a service like:
# - AWS CloudWatch
# - Google Cloud Logging
# - Datadog
# - Elastic Stack (ELK)

# Example with Docker logs in production
docker compose logs -f --tail=100 server
```

#### 3. Database Backups

```bash
# Daily automatic backup
0 2 * * * docker exec area_database pg_dump -U area_user area_db > /backups/area_$(date +\%Y\%m\%d).sql

# Restore from backup
docker exec -i area_database psql -U area_user -d area_db < /backups/area_20251030.sql
```

#### 4. Health Checks and Auto-Restart

All Docker services should have:
```yaml
restart: always
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

#### 5. Horizontal Scaling

To handle more traffic:
```bash
# Increase backend instances
docker compose -f docker-compose.prod.yml up -d --scale server=3
```

#### 6. Zero-Downtime Deployment

```bash
# 1. Pull new images
docker compose -f docker-compose.prod.yml pull

# 2. Rebuild without downtime
docker compose -f docker-compose.prod.yml up -d --no-deps --build server

# 3. Wait for new container to be healthy
docker compose -f docker-compose.prod.yml ps

# 4. Remove old images
docker image prune -f
```

### Rollback in Case of Issues

```bash
# 1. Identify previous version
docker images | grep area-backend

# 2. Retag previous version
docker tag area-backend:previous area-backend:latest

# 3. Redeploy
docker compose -f docker-compose.prod.yml up -d --force-recreate server

# 4. Check logs
docker logs area_server -f
```

### Production Monitoring

#### Metrics to Monitor

- CPU and memory of each container
- API request latency
- Error rate (4xx, 5xx)
- Active DB connections count
- PostgreSQL disk space usage
- Active AREAs count and trigger rate
- OpenAI token usage (to control costs)

#### Recommended Alerts

- Backend down (no response on `/health`)
- Database unreachable
- Disk space > 80%
- Error rate > 5%
- Average latency > 2 seconds
- Critical OAuth service failure

---

## Troubleshooting

### Issue: Service won't start

```bash
# Check logs
docker logs area_<service_name>

# Rebuild service
docker compose up -d --build <service_name>
```

### Issue: Database connection error

```bash
# Check PostgreSQL is running
docker compose ps

# Reset database
docker compose down -v
docker compose up -d database
npx prisma migrate deploy
```

### Issue: Invalid JWT token

- Check RSA keys exist in `keys/`
- Check keys are not corrupted
- Regenerate keys if necessary

### Issue: OAuth not working

- Check callback URLs in OAuth provider settings
- Check environment variables are correct
- Check backend logs for details

---

## Contribution

### Adding a New Microservice

1. Create folder in `backend/microservices/<name>`
2. Create `index.ts`, `Dockerfile`, `package.json`
3. Add service in `docker-compose.yml`
4. Add routes in `backend/src/routes/Area.Routes.ts`
5. Add service to database (via Prisma migration)
6. Document endpoints

### Code Standards

- TypeScript strict mode
- ESLint + Prettier
- Comments in French
- Naming in English

---

## License

This project is developed as part of the AREA project - Epitech Paris 2025.

---

## Contact & Support

For technical questions:
- Check Swagger documentation: `http://localhost:8080/api-docs`
- Check logs: `docker logs area_server`
- Consult main project README
