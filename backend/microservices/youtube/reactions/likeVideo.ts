import { YouTubeServiceAdapter } from '../youtube-adapter';

export interface LikeVideoConfig {
  videoId: string;
  useTemplates?: boolean;
}

export interface LikeVideoOutput {
  success: boolean;
  videoId: string;
  message: string;
  url: string;
}

export const likeVideoSchema = {
  type: 'object',
  properties: {
    videoId: {
      type: 'string',
      description: 'YouTube video ID to like. Supports template variables like {{action.videoId}}',
      examples: ['dQw4w9WgXcQ', '{{action.videoId}}'],
    },
    useTemplates: {
      type: 'boolean',
      default: true,
      description: 'Enable template variable replacement',
    },
  },
  required: ['videoId'],
};

export class LikeVideoReaction {
  constructor(private adapter: YouTubeServiceAdapter) {}

  private processTemplates(config: LikeVideoConfig, actionData: any): LikeVideoConfig {
    if (!config.useTemplates) {
      return config;
    }

    const processed = { ...config };

    // Replace template variables in videoId
    processed.videoId = this.replaceVariables(config.videoId, actionData);

    return processed;
  }

  private replaceVariables(text: string, data: any): string {
    return text.replace(/\{\{action\.(\w+)\}\}/g, (match, key) => {
      const value = data[key];
      return value !== undefined ? String(value) : match;
    });
  }

  async execute(config: LikeVideoConfig, actionData?: any): Promise<LikeVideoOutput> {
    try {
      const processedConfig = this.processTemplates(config, actionData || {});

      await this.adapter.likeVideo(processedConfig.videoId);

      return {
        success: true,
        videoId: processedConfig.videoId,
        message: 'Video liked successfully',
        url: `https://www.youtube.com/watch?v=${processedConfig.videoId}`,
      };
    } catch (error: any) {
      console.error('Error liking video:', error.message);
      return {
        success: false,
        videoId: config.videoId,
        message: `Failed to like video: ${error.message}`,
        url: `https://www.youtube.com/watch?v=${config.videoId}`,
      };
    }
  }

  validateConfig(config: any): boolean {
    return typeof config.videoId === 'string' && config.videoId.length > 0;
  }

  static getMetadata() {
    return {
      id: 'youtube_like_video',
      name: 'Like Video',
      description: 'Likes a YouTube video',
      service: 'youtube',
      category: 'interactions',
      configSchema: likeVideoSchema,
      outputExample: {
        success: true,
        videoId: 'dQw4w9WgXcQ',
        message: 'Video liked successfully',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
      requiredScopes: ['https://www.googleapis.com/auth/youtube.force-ssl'],
    };
  }
}
