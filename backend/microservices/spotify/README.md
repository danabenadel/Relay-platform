# Spotify Microservice for AREA

This microservice handles all Spotify-related actions (triggers) and reactions for the AREA project.

## Features

### Actions (Triggers)

1. **new_track_in_playlist** - Triggers when a new track is added to a specific playlist
2. **new_saved_track** - Triggers when user saves a new track to their library
3. **song_playing** - Triggers when a specific song is currently playing
4. **playlist_updated** - Triggers when a playlist is modified

### Reactions

1. **play_track** - Play a specific track
2. **add_to_playlist** - Add a track to a playlist
3. **create_playlist** - Create a new playlist
4. **save_track** - Save a track to user library
5. **pause_playback** - Pause current playback
6. **resume_playback** - Resume playback
7. **next_track** - Skip to next track
8. **previous_track** - Go to previous track
9. **set_volume** - Set playback volume (0-100)
10. **shuffle_toggle** - Toggle shuffle mode

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the microservice directory:

```env
SPOTIFY_SERVICE_PORT=5004
```

### 3. Run the Service

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## API Endpoints

### Health Check

```
GET /health
```

Returns service status.

### Check Actions

```
POST /actions/check
```

Request body:
```json
{
  "userId": "user-id",
  "actionType": "new_track_in_playlist",
  "config": {
    "playlistId": "spotify-playlist-id",
    "lastTrackId": "optional-last-track-id"
  },
  "accessToken": "spotify-access-token"
}
```

Response:
```json
{
  "success": true,
  "triggered": true,
  "data": {
    "trackName": "Song Name",
    "trackId": "track-id",
    "artist": "Artist Name",
    "album": "Album Name"
  }
}
```

### Trigger Reactions

```
POST /reactions/trigger
```

Request body:
```json
{
  "userId": "user-id",
  "reactionType": "play_track",
  "config": {
    "trackId": "spotify-track-id"
  },
  "accessToken": "spotify-access-token",
  "actionData": {}
}
```

Response:
```json
{
  "success": true,
  "message": "Reaction Spotify exécutée avec succès",
  "data": {
    "message": "Lecture de la piste lancée",
    "trackUri": "spotify:track:xxx"
  }
}
```

## Action Configuration Details

### new_track_in_playlist

Config:
```json
{
  "playlistId": "spotify-playlist-id",
  "lastTrackId": "optional-last-checked-track-id"
}
```

### new_saved_track

Config:
```json
{
  "lastSavedTrackId": "optional-last-checked-track-id"
}
```

### song_playing

Config:
```json
{
  "trackId": "optional-specific-track-id"
}
```

If `trackId` is provided, triggers only when that specific track is playing.
If omitted, triggers when any track is playing.

### playlist_updated

Config:
```json
{
  "playlistId": "spotify-playlist-id",
  "lastSnapshotId": "optional-last-snapshot-id"
}
```

## Reaction Configuration Details

### play_track

Config:
```json
{
  "trackId": "spotify-track-id"
}
```

### add_to_playlist

Config:
```json
{
  "playlistId": "target-playlist-id",
  "trackId": "track-id-to-add"
}
```

Can also use `actionData.trackId` from the triggered action.

### create_playlist

Config:
```json
{
  "playlistName": "Playlist Name",
  "description": "Optional description",
  "isPublic": false
}
```

### save_track

Config:
```json
{
  "trackId": "track-id-to-save"
}
```

Can also use `actionData.trackId` from the triggered action.

### set_volume

Config:
```json
{
  "volume": 50
}
```

Volume must be between 0-100.

### shuffle_toggle

Config:
```json
{
  "state": true
}
```

`true` to enable shuffle, `false` to disable.

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```

Common error codes:
- `400` - Bad Request (missing parameters)
- `500` - Internal Server Error (Spotify API errors)

## Spotify API Integration

This service uses the Spotify Web API. Key endpoints used:

- `GET /v1/me` - Get current user profile
- `GET /v1/me/tracks` - Get user's saved tracks
- `GET /v1/me/player/currently-playing` - Get currently playing track
- `GET /v1/playlists/{id}` - Get playlist details
- `PUT /v1/me/player/play` - Start/resume playback
- `PUT /v1/me/player/pause` - Pause playback
- `POST /v1/me/player/next` - Skip to next track
- `POST /v1/me/player/previous` - Previous track
- `PUT /v1/me/player/volume` - Set volume
- `PUT /v1/me/player/shuffle` - Toggle shuffle

## Token Management

This service expects valid Spotify access tokens to be provided in requests.
Token refresh is handled by the main backend service using the `spotify.token.service.ts`.

## Development

### Project Structure

```
spotify/
├── index.ts           # Main service file
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript config
└── README.md          # This file
```

### Adding New Actions/Reactions

1. Add the new case to the appropriate switch statement in `index.ts`
2. Update the database seed in `backend/prisma/seed.ts`
3. Update the about.json in `backend/src/index.ts`
4. Update this README

## Testing

Test the service with curl:

```bash
# Health check
curl http://localhost:5004/health

# Check action (requires valid Spotify access token)
curl -X POST http://localhost:5004/actions/check \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "actionType": "song_playing",
    "config": {},
    "accessToken": "YOUR_SPOTIFY_ACCESS_TOKEN"
  }'
```

## License

This project is part of the AREA application.
