import { YouTubeServiceAdapter } from '../youtube-adapter';

export interface AddToPlaylistConfig {
  playlistId: string;
  videoId: string;
  useTemplates?: boolean;
}

export interface AddToPlaylistOutput {
  success: boolean;
  playlistId: string;
  videoId: string;
  message: string;
  playlistUrl: string;
}

export const addToPlaylistSchema = {
  type: 'object',
  properties: {
    playlistId: {
      type: 'string',
      description: 'YouTube playlist ID where the video will be added',
      examples: ['PLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', '{{action.playlistId}}'],
    },
    videoId: {
      type: 'string',
      description: 'YouTube video ID to add to the playlist. Supports template variables like {{action.videoId}}',
      examples: ['dQw4w9WgXcQ', '{{action.videoId}}'],
    },
    useTemplates: {
      type: 'boolean',
      default: true,
      description: 'Enable template variable replacement',
    },
  },
  required: ['playlistId', 'videoId'],
};

export class AddToPlaylistReaction {
  constructor(private adapter: YouTubeServiceAdapter) {}

  private processTemplates(
    config: AddToPlaylistConfig,
    actionData: any
  ): AddToPlaylistConfig {
    if (!config.useTemplates) {
      return config;
    }

    const processed = { ...config };

    // Replace template variables
    processed.playlistId = this.replaceVariables(config.playlistId, actionData);
    processed.videoId = this.replaceVariables(config.videoId, actionData);

    return processed;
  }

  private replaceVariables(text: string, data: any): string {
    return text.replace(/\{\{action\.(\w+)\}\}/g, (match, key) => {
      const value = data[key];
      return value !== undefined ? String(value) : match;
    });
  }

  async execute(
    config: AddToPlaylistConfig,
    actionData?: any
  ): Promise<AddToPlaylistOutput> {
    try {
      const processedConfig = this.processTemplates(config, actionData || {});

      await this.adapter.addToPlaylist(
        processedConfig.playlistId,
        processedConfig.videoId
      );

      return {
        success: true,
        playlistId: processedConfig.playlistId,
        videoId: processedConfig.videoId,
        message: 'Video added to playlist successfully',
        playlistUrl: `https://www.youtube.com/playlist?list=${processedConfig.playlistId}`,
      };
    } catch (error: any) {
      console.error('Error adding to playlist:', error.message);
      return {
        success: false,
        playlistId: config.playlistId,
        videoId: config.videoId,
        message: `Failed to add video to playlist: ${error.message}`,
        playlistUrl: `https://www.youtube.com/playlist?list=${config.playlistId}`,
      };
    }
  }

  validateConfig(config: any): boolean {
    return (
      typeof config.playlistId === 'string' &&
      config.playlistId.length > 0 &&
      typeof config.videoId === 'string' &&
      config.videoId.length > 0
    );
  }

  static getMetadata() {
    return {
      id: 'youtube_add_to_playlist',
      name: 'Add to Playlist',
      description: 'Adds a video to a YouTube playlist',
      service: 'youtube',
      category: 'playlists',
      configSchema: addToPlaylistSchema,
      outputExample: {
        success: true,
        playlistId: 'PLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        videoId: 'dQw4w9WgXcQ',
        message: 'Video added to playlist successfully',
        playlistUrl: 'https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      },
      requiredScopes: ['https://www.googleapis.com/auth/youtube.force-ssl'],
    };
  }
}
