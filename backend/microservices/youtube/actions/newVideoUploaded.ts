import { YouTubeServiceAdapter } from '../youtube-adapter';

export interface NewVideoUploadedConfig {
  channelId: string;
  checkInterval?: number;
  includeShorts?: boolean;
  minDuration?: number;
}

export interface NewVideoUploadedOutput {
  videoId: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnails: {
    default?: string;
    medium?: string;
    high?: string;
  };
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
  tags?: string[];
  url: string;
}

export const newVideoUploadedSchema = {
  type: 'object',
  properties: {
    channelId: {
      type: 'string',
      description: 'YouTube channel ID to monitor (e.g., UCuAXFkgsw1L7xaCfnd5JJOw)',
      examples: ['UCuAXFkgsw1L7xaCfnd5JJOw', 'UC_x5XG1OV2P6uZZ5FSM9Ttw'],
    },
    checkInterval: {
      type: 'number',
      minimum: 60,
      maximum: 3600,
      default: 60,
      description: 'How often to check for new videos (in seconds)',
    },
    includeShorts: {
      type: 'boolean',
      default: true,
      description: 'Include YouTube Shorts in the results',
    },
    minDuration: {
      type: 'number',
      minimum: 0,
      description: 'Minimum video duration in seconds (optional filter)',
    },
  },
  required: ['channelId'],
};

export interface ActionCheckResult<T> {
  items: T[];
  cursor?: string;
}

export class NewVideoUploadedAction {
  constructor(private adapter: YouTubeServiceAdapter) {}

  async check(
    config: NewVideoUploadedConfig,
    lastVideoId?: string
  ): Promise<ActionCheckResult<NewVideoUploadedOutput>> {
    try {
      const publishedAfter = lastVideoId
        ? undefined
        : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const videos = await this.adapter.listVideos({
        channelId: config.channelId,
        maxResults: 10,
        order: 'date',
        publishedAfter,
      });

      const latestVideoId = videos[0]?.id;

      if (!lastVideoId) {
        console.log('[YouTube NewVideoUploaded] First run - initializing with most recent video, no triggers');
        return {
          items: [],
          cursor: latestVideoId
        };
      }

      const newVideos: NewVideoUploadedOutput[] = [];

      for (const video of videos) {
        if (lastVideoId && video.id === lastVideoId) {
          break;
        }

        if (!config.includeShorts && video.description.includes('#Shorts')) {
          continue;
        }

        newVideos.push({
          videoId: video.id,
          title: video.title,
          description: video.description,
          channelId: video.channelId,
          channelTitle: video.channelTitle,
          publishedAt: video.publishedAt,
          thumbnails: video.thumbnails,
          viewCount: video.viewCount,
          likeCount: video.likeCount,
          commentCount: video.commentCount,
          tags: video.tags,
          url: `https://www.youtube.com/watch?v=${video.id}`,
        });
      }

      return {
        items: newVideos.reverse(),
        cursor: latestVideoId ?? lastVideoId
      };
    } catch (error: any) {
      console.error('Error checking for new videos:', error.message);
      throw error;
    }
  }

  validateConfig(config: any): boolean {
    return (
      typeof config.channelId === 'string' &&
      config.channelId.length > 0
    );
  }

  static getMetadata() {
    return {
      id: 'youtube_new_video_uploaded',
      name: 'New Video Uploaded',
      description: 'Triggers when a new video is uploaded to a YouTube channel',
      service: 'youtube',
      category: 'videos',
      configSchema: newVideoUploadedSchema,
      outputExample: {
        videoId: 'dQw4w9WgXcQ',
        title: 'Amazing Video Title',
        description: 'Video description here',
        channelId: 'UCuAXFkgsw1L7xaCfnd5JJOw',
        channelTitle: 'Channel Name',
        publishedAt: '2025-01-15T10:30:00Z',
        thumbnails: {
          default: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg',
          medium: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
          high: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        },
        viewCount: '1000',
        likeCount: '100',
        commentCount: '20',
        tags: ['tutorial', 'tech'],
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
      requiredScopes: ['https://www.googleapis.com/auth/youtube.readonly'],
    };
  }
}
