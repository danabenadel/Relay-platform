import { YouTubeServiceAdapter } from '../youtube-adapter';

export interface LivestreamStartedConfig {
  channelId: string;
  checkInterval?: number; 
  titleKeywords?: string[];
}

export interface LivestreamStartedOutput {
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
  url: string;
  isLive: boolean;
}

export interface ActionCheckResult<T> {
  items: T[];
  cursor?: string;
}

export const livestreamStartedSchema = {
  type: 'object',
  properties: {
    channelId: {
      type: 'string',
      description: 'YouTube channel ID to monitor for live streams',
      examples: ['UCuAXFkgsw1L7xaCfnd5JJOw', 'UC_x5XG1OV2P6uZZ5FSM9Ttw'],
    },
    checkInterval: {
      type: 'number',
      minimum: 60,
      maximum: 3600,
      default: 60,
      description: 'How often to check for live streams (in seconds)',
    },
    titleKeywords: {
      type: 'array',
      items: {
        type: 'string',
      },
      description: 'Only trigger for streams with these keywords in the title (case-insensitive)',
      examples: [['gaming', 'gameplay'], ['tutorial', 'guide']],
    },
  },
  required: ['channelId'],
};

export class LivestreamStartedAction {
  constructor(private adapter: YouTubeServiceAdapter) {}

  async check(
    config: LivestreamStartedConfig,
    lastLiveId?: string
  ): Promise<ActionCheckResult<LivestreamStartedOutput>> {
    try {
      const liveVideos = await this.adapter.getLiveBroadcasts({
        channelId: config.channelId,
        broadcastStatus: 'active',
        maxResults: 10,
      });

      const latestLiveId = liveVideos[0]?.id;

      if (!lastLiveId) {
        console.log('[YouTube LivestreamStarted] First run - initializing with current live streams, no triggers');
        return {
          items: [],
          cursor: latestLiveId
        };
      }

      const newLiveStreams: LivestreamStartedOutput[] = [];

      for (const video of liveVideos) {
        if (lastLiveId && video.id === lastLiveId) {
          continue;
        }

        const isLive = video.liveBroadcastContent === 'live';
        if (!isLive) {
          continue;
        }

        if (config.titleKeywords && config.titleKeywords.length > 0) {
          const titleLower = video.title.toLowerCase();
          const hasKeyword = config.titleKeywords.some((keyword) =>
            titleLower.includes(keyword.toLowerCase())
          );
          if (!hasKeyword) {
            continue;
          }
        }

        newLiveStreams.push({
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
          url: `https://www.youtube.com/watch?v=${video.id}`,
          isLive: true,
        });
      }

      return {
        items: newLiveStreams,
        cursor: latestLiveId ?? lastLiveId
      };
    } catch (error: any) {
      console.error('Error checking for live streams:', error.message);
      throw error;
    }
  }

  validateConfig(config: any): boolean {
    return typeof config.channelId === 'string' && config.channelId.length > 0;
  }

  static getMetadata() {
    return {
      id: 'youtube_livestream_started',
      name: 'Livestream Started',
      description: 'Triggers when a YouTube channel starts a live stream',
      service: 'youtube',
      category: 'live',
      configSchema: livestreamStartedSchema,
      outputExample: {
        videoId: 'dQw4w9WgXcQ',
        title: 'Live Gaming Session - Fortnite',
        description: 'Join me for an epic gaming session!',
        channelId: 'UCuAXFkgsw1L7xaCfnd5JJOw',
        channelTitle: 'Gaming Channel',
        publishedAt: '2025-01-15T10:30:00Z',
        thumbnails: {
          default: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default_live.jpg',
          medium: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault_live.jpg',
          high: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault_live.jpg',
        },
        viewCount: '1234',
        likeCount: '50',
        commentCount: '15',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        isLive: true,
      },
      requiredScopes: ['https://www.googleapis.com/auth/youtube.readonly'],
    };
  }
}
