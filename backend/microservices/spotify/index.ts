import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const PORT = process.env.SPOTIFY_SERVICE_PORT || 5004;

// ==================== INTERFACES ====================

interface SpotifyActionPayload {
  userId: string;
  actionType: string;
  config: any;
}

interface SpotifyReactionPayload {
  userId: string;
  reactionType: string;
  config: any;
  accessToken: string;
}

// ==================== HELPER FUNCTIONS ====================

const extractSpotifyId = (value: string): string => {
  if (!value) return value;

  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  // Handle URI format spotify:xxx:ID
  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");
    const last = parts[parts.length - 1];
    if (/^[A-Za-z0-9]{22}$/.test(last)) {
      return last;
    }
  }

  // Remove query params if URL
  const clean = trimmed.split("?")[0];

  const match = clean.match(/[A-Za-z0-9]{22}/);
  if (match) {
    return match[0];
  }

  return trimmed;
};

const normaliseTrackReference = (
  ...values: (string | undefined | null)[]
) => {
  for (const raw of values) {
    if (!raw) continue;
    const id = extractSpotifyId(raw);
    if (id) {
      return {
        id,
        uri: `spotify:track:${id}`,
      };
    }
  }

  return { id: undefined, uri: undefined };
};

const makeSpotifyRequest = async (
  endpoint: string,
  accessToken: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
) => {
  try {
    const response = await axios({
      method,
      url: `https://api.spotify.com/v1${endpoint}`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      data
    });
    return response.data;
  } catch (error: any) {
    console.error(`[Spotify API] Error on ${endpoint}:`, error.response?.data || error.message);

    const errorData = error.response?.data?.error;
    const status = error.response?.status;
    const reason = errorData?.reason;

    // Create a structured error with specific handling for common cases
    const errorMessage = errorData?.message || 'Spotify API request failed';
    const structuredError: any = new Error(errorMessage);
    structuredError.status = status;
    structuredError.reason = reason;
    structuredError.isNoActiveDevice = reason === 'NO_ACTIVE_DEVICE';

    throw structuredError;
  }
};

// ==================== ACTIONS (Triggers) ====================

app.post("/actions/check", async (req, res) => {
  try {
    const { userId, actionType, config, accessToken } = req.body as SpotifyActionPayload & { accessToken: string };

    if (!userId || !actionType || !accessToken) {
      return res.status(400).json({
        success: false,
        error: "userId, actionType et accessToken sont requis"
      });
    }

    let triggered = false;
    let actionData = {};

    switch (actionType) {
      case "new_track_in_playlist": {
        const playlistIdRaw = config.playlist_id || config.playlistId;
        if (!playlistIdRaw) {
          return res.status(400).json({ success: false, error: "playlist_id requis" });
        }

        const playlistId = extractSpotifyId(playlistIdRaw);

        const playlist = await makeSpotifyRequest(
          `/playlists/${playlistId}/tracks?limit=5`,
          accessToken
        );

        console.log(`[Spotify Debug] Playlist tracks:`, playlist.items?.map((item: any) => ({
          name: item.track.name,
          id: item.track.id,
          added_at: item.added_at
        })));

        if (playlist.items && playlist.items.length > 0) {
          const sortedItems = [...playlist.items].sort((a: any, b: any) =>
            new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
          );
          const latestTrack = sortedItems[0].track;
          console.log(`[Spotify Debug] Latest track:`, latestTrack.name, latestTrack.id);
          if (config.lastTrackId && latestTrack.id !== config.lastTrackId) {
            triggered = true;
            actionData = {
              trackName: latestTrack.name,
              trackId: latestTrack.id,
              artist: latestTrack.artists[0]?.name,
              album: latestTrack.album?.name,
              lastTrackId: latestTrack.id
            };
          } else if (!config.lastTrackId) {
            actionData = {
              lastTrackId: latestTrack.id
            };
          } else {
            actionData = {
              lastTrackId: config.lastTrackId
            };
          }
        }
        break;
      }

      case "new_saved_track": {
        const savedTracks = await makeSpotifyRequest(
          `/me/tracks?limit=1`,
          accessToken
        );

        if (savedTracks.items && savedTracks.items.length > 0) {
          const latestTrack = savedTracks.items[0].track;

          if (config.lastSavedTrackId && latestTrack.id !== config.lastSavedTrackId) {
            triggered = true;
            actionData = {
              trackName: latestTrack.name,
              trackId: latestTrack.id,
              artist: latestTrack.artists[0]?.name,
              album: latestTrack.album?.name,
              lastSavedTrackId: latestTrack.id
            };
          } else if (!config.lastSavedTrackId) {
            actionData = {
              lastSavedTrackId: latestTrack.id
            };
          }
        }
        break;
      }

      case "song_playing": {
        const currentlyPlaying = await makeSpotifyRequest(
          `/me/player/currently-playing`,
          accessToken
        );

        if (currentlyPlaying && currentlyPlaying.item && currentlyPlaying.is_playing) {
          const track = currentlyPlaying.item;
          const targetTrack = normaliseTrackReference(
            config.trackId,
            config.track_id,
            config.trackUri,
            config.track_uri
          );

          if (targetTrack.id) {
            if (track.id === targetTrack.id) {
              triggered = true;
              actionData = {
                trackName: track.name,
                trackId: track.id,
                artist: track.artists[0]?.name,
                progress: currentlyPlaying.progress_ms
              };
            }
          } else {
            const isNewSong =
              !config.lastTriggeredTrackId || config.lastTriggeredTrackId !== track.id;

            if (isNewSong) {
              triggered = true;
              actionData = {
                trackName: track.name,
                trackId: track.id,
                artist: track.artists[0]?.name,
                progress: currentlyPlaying.progress_ms,
                lastTriggeredTrackId: track.id
              };
            } else {
              actionData = {
                lastTriggeredTrackId: config.lastTriggeredTrackId
              };
            }
          }
        }
        break;
      }

      case "playlist_updated": {
        const playlistIdRaw = config.playlist_id || config.playlistId;
        if (!playlistIdRaw) {
          return res.status(400).json({ success: false, error: "playlistId requis" });
        }

        const playlistId = extractSpotifyId(playlistIdRaw);

        const playlist = await makeSpotifyRequest(
          `/playlists/${playlistId}`,
          accessToken
        );

        if (config.lastSnapshotId && playlist.snapshot_id !== config.lastSnapshotId) {
          const playlistTracks = await makeSpotifyRequest(
            `/playlists/${playlistId}/tracks?limit=1`,
          accessToken
        );

          const latestTrack = playlistTracks.items?.[0]?.track;

          triggered = true;
          actionData = {
            playlistName: playlist.name,
            playlistId: playlist.id,
            snapshotId: playlist.snapshot_id,
            trackCount: playlist.tracks.total,
            lastSnapshotId: playlist.snapshot_id
          };

          if (latestTrack) {
            (actionData as any).trackId = latestTrack.id;
            (actionData as any).trackName = latestTrack.name;
            (actionData as any).artist = latestTrack.artists?.[0]?.name;
          }
        } else if (!config.lastSnapshotId) {
          actionData = {
            lastSnapshotId: playlist.snapshot_id
          };
        } else {
          actionData = {
            lastSnapshotId: config.lastSnapshotId
          };
        }
        break;
      }

      default:
        return res.status(400).json({
          success: false,
          error: `Action type inconnu: ${actionType}`
        });
    }

    res.json({
      success: true,
      triggered,
      data: actionData
    });

  } catch (error: any) {
    console.error("Erreur Spotify Action:", error.message);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la vérification de l'action Spotify",
      details: error.message
    });
  }
});

// ==================== REACTIONS ====================

app.post("/reactions/trigger", async (req, res) => {
  try {
    const { userId, reactionType, config, accessToken, actionData } = req.body as SpotifyReactionPayload & { actionData?: any };

    if (!userId || !reactionType || !accessToken) {
      return res.status(400).json({
        success: false,
        error: "userId, reactionType et accessToken sont requis"
      });
    }

    let result: any = {};

    switch (reactionType) {
      case "play_track": {
        const trackRef = normaliseTrackReference(
          config.trackUri,
          config.track_uri,
          config.trackId,
          config.track_id,
          actionData?.trackId
        );

        if (!trackRef.uri) {
          return res.status(400).json({ success: false, error: "trackUri ou trackId requis" });
        }

        await makeSpotifyRequest(
          `/me/player/play`,
          accessToken,
          'PUT',
          { uris: [trackRef.uri] }
        );

        result = { message: "Lecture de la piste lancée", trackUri: trackRef.uri };
        break;
      }

      case "add_to_playlist": {
        const playlistRef = extractSpotifyId(config.playlist_id || config.playlistId);
        const trackRef = normaliseTrackReference(
          config.trackUri,
          config.track_uri,
          config.trackId,
          config.track_id,
          actionData?.trackId
        );

        if (!playlistRef || !trackRef.uri) {
          return res.status(400).json({
            success: false,
            error: "playlistId et trackUri/trackId requis"
          });
        }

        await makeSpotifyRequest(
          `/playlists/${playlistRef}/tracks`,
          accessToken,
          'POST',
          { uris: [trackRef.uri] }
        );

        result = { message: "Piste ajoutée à la playlist", playlistId: playlistRef, trackUri: trackRef.uri };
        break;
      }

      case "create_playlist": {
        const playlistName = config.playlistName || "Nouvelle Playlist AREA";
        const description = config.description || "Créée automatiquement par AREA";
        const isPublic = config.isPublic !== undefined ? config.isPublic : false;

        const userProfile = await makeSpotifyRequest(`/me`, accessToken);
        const playlist = await makeSpotifyRequest(
          `/users/${userProfile.id}/playlists`,
          accessToken,
          'POST',
          {
            name: playlistName,
            description,
            public: isPublic
          }
        );

        result = {
          message: "Playlist créée",
          playlistId: playlist.id,
          playlistName: playlist.name,
          playlistUrl: playlist.external_urls.spotify
        };
        break;
      }

      case "save_track": {
        const trackRef = normaliseTrackReference(
          config.trackId,
          config.track_id,
          actionData?.trackId
        );

        if (!trackRef.id) {
          return res.status(400).json({ success: false, error: "trackId requis" });
        }

        await makeSpotifyRequest(
          `/me/tracks`,
          accessToken,
          'PUT',
          { ids: [trackRef.id] }
        );

        result = { message: "Piste ajoutée aux favoris", trackId: trackRef.id };
        break;
      }

      case "pause_playback": {
        await makeSpotifyRequest(
          `/me/player/pause`,
          accessToken,
          'PUT'
        );

        result = { message: "Lecture mise en pause" };
        break;
      }

      case "resume_playback": {
        await makeSpotifyRequest(
          `/me/player/play`,
          accessToken,
          'PUT'
        );

        result = { message: "Lecture reprise" };
        break;
      }

      case "next_track": {
        try {
          const devices = await makeSpotifyRequest('/me/player/devices', accessToken);
          const activeDevice = devices.devices?.find((d: any) => d.is_active);

          if (!activeDevice) {
            const currentPlayback = await makeSpotifyRequest('/me/player', accessToken);
            if (!currentPlayback || !currentPlayback.device) {
              throw new Error('NO_ACTIVE_DEVICE');
            }
          }

          await makeSpotifyRequest(
            `/me/player/next`,
            accessToken,
            'POST'
          );

          result = { message: "Piste suivante" };
        } catch (error: any) {
          if (error.message === 'NO_ACTIVE_DEVICE' || error.status === 404) {
            throw new Error('Aucun appareil Spotify actif trouvé. Veuillez ouvrir Spotify sur un appareil et commencer la lecture.');
          }
          throw error;
        }
        break;
      }

      case "previous_track": {
        try {
          const devices = await makeSpotifyRequest('/me/player/devices', accessToken);
          const activeDevice = devices.devices?.find((d: any) => d.is_active);

          if (!activeDevice) {
            const currentPlayback = await makeSpotifyRequest('/me/player', accessToken);
            if (!currentPlayback || !currentPlayback.device) {
              throw new Error('NO_ACTIVE_DEVICE');
            }
          }

          await makeSpotifyRequest(
            `/me/player/previous`,
            accessToken,
            'POST'
          );

          result = { message: "Piste précédente" };
        } catch (error: any) {
          if (error.message === 'NO_ACTIVE_DEVICE' || error.status === 404) {
            throw new Error('Aucun appareil Spotify actif trouvé. Veuillez ouvrir Spotify sur un appareil et commencer la lecture.');
          }
          throw error;
        }
        break;
      }

      case "set_volume": {
        const volume = config.volume;
        if (volume === undefined || volume < 0 || volume > 100) {
          return res.status(400).json({
            success: false,
            error: "volume requis (0-100)"
          });
        }

        await makeSpotifyRequest(
          `/me/player/volume?volume_percent=${volume}`,
          accessToken,
          'PUT'
        );

        result = { message: `Volume réglé à ${volume}%`, volume };
        break;
      }

      case "shuffle_toggle": {
        const state = config.state !== undefined ? config.state : true;

        await makeSpotifyRequest(
          `/me/player/shuffle?state=${state}`,
          accessToken,
          'PUT'
        );

        result = { message: `Lecture aléatoire ${state ? 'activée' : 'désactivée'}`, shuffle: state };
        break;
      }

      default:
        return res.status(400).json({
          success: false,
          error: `Reaction type inconnu: ${reactionType}`
        });
    }

    console.log(`[Spotify Reaction] ${reactionType} exécuté pour l'utilisateur ${userId}`);

    res.json({
      success: true,
      message: "Reaction Spotify exécutée avec succès",
      data: result
    });

  } catch (error: any) {
    console.error("Erreur Spotify Reaction:", error.message);

    if (error.isNoActiveDevice) {
      return res.status(400).json({
        success: false,
        error: "Aucun appareil Spotify actif",
        details: "Veuillez ouvrir Spotify sur un appareil (ordinateur, téléphone, enceinte connectée) et réessayer.",
        reason: "NO_ACTIVE_DEVICE"
      });
    }

    if (error.message?.includes('Invalid base62 id')) {
      return res.status(400).json({
        success: false,
        error: "ID Spotify invalide",
        details: "L'identifiant de playlist ou de piste fourni n'est pas valide. Veuillez vérifier l'URL ou l'ID.",
        reason: "INVALID_ID"
      });
    }

    res.status(error.status || 500).json({
      success: false,
      error: "Erreur lors de l'exécution de la reaction Spotify",
      details: error.message,
      reason: error.reason
    });
  }
});

// ==================== POLLING MANAGEMENT ====================

const activePollers = new Map<string, NodeJS.Timeout>();

app.post("/actions/start", async (req, res) => {
  try {
    const { userId, areaId, actionType, interval, config, accessToken } = req.body;

    if (!userId || !areaId || !actionType || !accessToken) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }

    const pollerKey = `${userId}:${areaId}`;

    if (activePollers.has(pollerKey)) {
      return res.status(400).json({
        success: false,
        error: "Poller already active for this AREA"
      });
    }

    console.log(`[Spotify] Starting poller for AREA ${areaId}, type: ${actionType}, interval: ${interval || 30}s`);

    let currentConfig = { ...config };

    const poller = setInterval(async () => {
      try {
        console.log(`[Spotify] Checking action for AREA ${areaId}...`);

        const checkResult = await axios.post(`http://localhost:${PORT}/actions/check`, {
          userId,
          actionType,
          config: currentConfig,
          accessToken
        });

        if (checkResult.data.data) {
          console.log(`[Spotify] Updating config for AREA ${areaId}:`, checkResult.data.data);
          currentConfig = { ...currentConfig, ...checkResult.data.data };
        }

        if (checkResult.data.triggered) {
          console.log(`[Spotify] Action triggered for AREA ${areaId}! Executing reaction...`);

          const backendUrl = process.env.BACKEND_API || 'http://area_server:8080';
          const triggerUrl = `${backendUrl}/api/areas/triggers/execute`;
          const requestData = {
            userId,
            areaId,
            actionType,
            data: checkResult.data.data
          };

          console.log(`[Spotify] Calling backend URL: ${triggerUrl}`);
          console.log(`[Spotify] Request data:`, JSON.stringify(requestData, null, 2));

          const triggerResponse = await axios.post(triggerUrl, requestData);
          console.log(`[Spotify] Backend response:`, triggerResponse.status, triggerResponse.data);
        }
      } catch (error: any) {
        console.error(`[Spotify] Error checking action for AREA ${areaId}:`, error.message);
        if (error.response) {
          console.error(`[Spotify] HTTP Status:`, error.response.status);
          console.error(`[Spotify] Response data:`, error.response.data);
          console.error(`[Spotify] URL attempted:`, error.config?.url);
        }
      }
    }, (interval || 30) * 1000);

    activePollers.set(pollerKey, poller);

    res.json({
      success: true,
      message: "Spotify poller started"
    });
  } catch (error: any) {
    console.error('[Spotify] Error starting poller:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/actions/stop", async (req, res) => {
  try {
    const { userId, areaId } = req.body;
    const pollerKey = `${userId}:${areaId}`;

    if (activePollers.has(pollerKey)) {
      clearInterval(activePollers.get(pollerKey)!);
      activePollers.delete(pollerKey);
      console.log(`[Spotify] Stopped poller for AREA ${areaId}`);
    }

    res.json({
      success: true,
      message: "Spotify poller stopped"
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get("/actions/status", (_req, res) => {
  const activeCount = activePollers.size;
  const activeAreas = Array.from(activePollers.keys());

  res.json({
    success: true,
    activePollers: activeCount,
    areas: activeAreas
  });
});

// ==================== UTILITY ENDPOINTS ====================

app.get("/devices", async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: "Access token requis"
      });
    }

    const devices = await makeSpotifyRequest('/me/player/devices', accessToken);

    res.json({
      success: true,
      devices: devices.devices || [],
      hasActiveDevice: devices.devices?.some((d: any) => d.is_active) || false
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des appareils",
      details: error.message
    });
  }
});

// ==================== HEALTH CHECK ====================

app.get("/health", (_req, res) => {
  res.json({ status: "OK", service: "spotify" });
});

// ==================== SERVER ====================

app.listen(PORT, () => {
  console.log(`Spotify service en ligne sur le port ${PORT}`);
});
