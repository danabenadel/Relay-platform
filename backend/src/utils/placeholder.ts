export interface PlaceholderData {
  [key: string]: any;
}

export function replacePlaceholders(text: string, data: PlaceholderData): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    const value = getNestedValue(data, trimmedKey);
    return value !== undefined && value !== null ? String(value) : match;
  });
}

export function replacePlaceholdersInConfig(
  config: any,
  data: PlaceholderData
): any {
  if (!config || typeof config !== 'object') {
    return config;
  }

  if (typeof config === 'string') {
    return replacePlaceholders(config, data);
  }

  if (Array.isArray(config)) {
    return config.map(item => replacePlaceholdersInConfig(item, data));
  }

  const newConfig: any = {};
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string') {
      newConfig[key] = replacePlaceholders(value, data);
    } else if (typeof value === 'object' && value !== null) {
      newConfig[key] = replacePlaceholdersInConfig(value, data);
    } else {
      newConfig[key] = value;
    }
  }

  return newConfig;
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current?.[key];
  }, obj);
}

export function containsPlaceholders(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }
  return /\{\{[^}]+\}\}/.test(text);
}

export function extractPlaceholderKeys(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const matches = text.matchAll(/\{\{([^}]+)\}\}/g);
  return Array.from(matches).map(match => match[1].trim());
}

export const SPOTIFY_ACTION_PLACEHOLDERS = {
  new_track_in_playlist: ['trackName', 'trackId', 'artist', 'album', 'playlistName', 'playlistId'],
  new_saved_track: ['trackName', 'trackId', 'artist', 'album'],
  song_playing: ['trackName', 'trackId', 'artist', 'progress'],
  playlist_updated: ['playlistName', 'playlistId', 'snapshotId', 'trackCount']
};

export function getAvailablePlaceholders(actionType: string): string[] {
  return SPOTIFY_ACTION_PLACEHOLDERS[actionType as keyof typeof SPOTIFY_ACTION_PLACEHOLDERS] || [];
}
