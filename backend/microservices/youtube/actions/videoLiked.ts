import { YouTubeServiceAdapter } from '../youtube-adapter';

export interface VideoLikedConfig {
  checkInterval?: number;
  channelFilter?: string;
  categoryFilter?: string;
}

export interface VideoLikedOutput {
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

export interface ActionCheckResult<T> {
  items: T[];
  cursor?: string;
}

export const videoLikedSchema = {
  type: 'object',
  properties: {
    checkInterval: {
      type: 'number',
      minimum: 60,
      maximum: 3600,
      default: 60,
      description: 'How often to check for newly liked videos (in seconds)',
    },
    channelFilter: {
      type: 'string',
      description: 'Only trigger for videos from channels matching this name (case-insensitive)',
    },
    categoryFilter: {
      type: 'string',
      description: 'Filter by YouTube category ID (e.g., "10" for Music, "20" for Gaming)',
    },
  },
};

export class VideoLikedAction {
  constructor(private adapter: YouTubeServiceAdapter) {}

  async check(
    config: VideoLikedConfig,
    lastVideoId?: string
  ): Promise<ActionCheckResult<VideoLikedOutput>> {
    try {
      const likedVideos = await this.adapter.getLikedVideos(50);

      const latestLikedVideoId = likedVideos[0]?.id;

      if (!lastVideoId) {
        console.log('[YouTube VideoLiked] First run - initializing with most recent liked video, no triggers');
        return {
          items: [],
          cursor: latestLikedVideoId
        };
      }

      const newLikedVideos: VideoLikedOutput[] = [];
      let foundLast = false;

      for (const video of likedVideos) {
        if (video.id === lastVideoId) {
          foundLast = true;
          continue;
        }

        if (!foundLast) {
          continue;
        }

        if (config.channelFilter) {
          if (
            !video.channelTitle
              .toLowerCase()
              .includes(config.channelFilter.toLowerCase())
          ) {
            continue;
          }
        }

        if (config.categoryFilter && video.categoryId !== config.categoryFilter) {
          continue;
        }

        newLikedVideos.push({
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
        items: newLikedVideos.reverse(),
        cursor: latestLikedVideoId ?? lastVideoId
      };
    } catch (error: any) {
      console.error('Error checking for liked videos:', error.message);
      throw error;
    }
  }

  validateConfig(config: any): boolean {
    return true;
  }

  static getMetadata() {
    return {
      id: 'youtube_video_liked',
      name: 'Video Liked',
      description: 'Triggers when you like a YouTube video',
      service: 'youtube',
      category: 'interactions',
      configSchema: videoLikedSchema,
      outputExample: {
        videoId: 'dQw4w9WgXcQ',
        title: 'Amazing Video',
        description: 'This is an amazing video',
        channelId: 'UCuAXFkgsw1L7xaCfnd5JJOw',
        channelTitle: 'Cool Channel',
        publishedAt: '2025-01-15T10:30:00Z',
        thumbnails: {
          default: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg',
          medium: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
          high: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        },
        viewCount: '1000000',
        likeCount: '50000',
        commentCount: '2000',
        tags: ['music', 'entertainment'],
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
      requiredScopes: ['https://www.googleapis.com/auth/youtube.readonly'],
    };
  }
}
