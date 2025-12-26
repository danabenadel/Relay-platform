import { YouTubeServiceAdapter, PlaylistData } from '../youtube-adapter';

export interface CreatePlaylistConfig {
  title: string;
  description?: string;
  privacyStatus?: 'private' | 'public' | 'unlisted';
  useTemplates?: boolean;
}

export interface CreatePlaylistOutput {
  success: boolean;
  playlistId: string;
  title: string;
  description: string;
  url: string;
  privacyStatus: string;
}

export const createPlaylistSchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: 'Playlist title. Supports template variables like {{action.channelTitle}}',
      examples: [
        'My Favorites',
        'Videos from {{action.channelTitle}}',
        'Liked on {{action.publishedAt}}',
      ],
    },
    description: {
      type: 'string',
      description: 'Playlist description. Supports template variables',
      examples: [
        'Collection of my favorite videos',
        'Videos about {{action.title}}',
      ],
    },
    privacyStatus: {
      type: 'string',
      enum: ['private', 'public', 'unlisted'],
      default: 'private',
      description: 'Playlist privacy setting',
    },
    useTemplates: {
      type: 'boolean',
      default: true,
      description: 'Enable template variable replacement',
    },
  },
  required: ['title'],
};

export class CreatePlaylistReaction {
  constructor(private adapter: YouTubeServiceAdapter) {}

  private processTemplates(
    config: CreatePlaylistConfig,
    actionData: any
  ): CreatePlaylistConfig {
    if (!config.useTemplates) {
      return config;
    }

    const processed = { ...config };

    // Replace template variables
    processed.title = this.replaceVariables(config.title, actionData);
    if (config.description) {
      processed.description = this.replaceVariables(config.description, actionData);
    }

    return processed;
  }

  private replaceVariables(text: string, data: any): string {
    return text.replace(/\{\{action\.(\w+)\}\}/g, (match, key) => {
      const value = data[key];
      return value !== undefined ? String(value) : match;
    });
  }

  async execute(
    config: CreatePlaylistConfig,
    actionData?: any
  ): Promise<CreatePlaylistOutput> {
    try {
      console.log('[YouTube CreatePlaylist] Starting execution');
      console.log('[YouTube CreatePlaylist] Config:', JSON.stringify(config, null, 2));
      console.log('[YouTube CreatePlaylist] Action data:', JSON.stringify(actionData, null, 2));

      const processedConfig = this.processTemplates(config, actionData || {});
      console.log('[YouTube CreatePlaylist] Processed config:', JSON.stringify(processedConfig, null, 2));

      const playlist = await this.adapter.createPlaylist({
        title: processedConfig.title,
        description: processedConfig.description,
        privacyStatus: processedConfig.privacyStatus || 'private',
      });

      console.log('[YouTube CreatePlaylist] Playlist created successfully:', playlist.id);
      return {
        success: true,
        playlistId: playlist.id,
        title: playlist.title,
        description: playlist.description,
        url: `https://www.youtube.com/playlist?list=${playlist.id}`,
        privacyStatus: processedConfig.privacyStatus || 'private',
      };
    } catch (error: any) {
      console.error('[YouTube CreatePlaylist] ERROR:', error.message);
      console.error('[YouTube CreatePlaylist] Error details:', error.response?.data || error.stack);
      return {
        success: false,
        playlistId: '',
        title: config.title,
        description: config.description || '',
        url: '',
        privacyStatus: config.privacyStatus || 'private',
      };
    }
  }

  validateConfig(config: any): boolean {
    return typeof config.title === 'string' && config.title.length > 0;
  }

  static getMetadata() {
    return {
      id: 'youtube_create_playlist',
      name: 'Create Playlist',
      description: 'Creates a new YouTube playlist',
      service: 'youtube',
      category: 'playlists',
      configSchema: createPlaylistSchema,
      outputExample: {
        success: true,
        playlistId: 'PLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        title: 'My New Playlist',
        description: 'A collection of awesome videos',
        url: 'https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        privacyStatus: 'private',
      },
      requiredScopes: ['https://www.googleapis.com/auth/youtube.force-ssl'],
    };
  }
}
