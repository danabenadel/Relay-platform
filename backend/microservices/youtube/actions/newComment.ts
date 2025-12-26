import { YouTubeServiceAdapter } from '../youtube-adapter';

export interface NewCommentConfig {
  videoId: string;
  checkInterval?: number;
  filterKeywords?: string[];
  authorFilter?: string;
}

export interface NewCommentOutput {
  commentId: string;
  videoId: string;
  authorDisplayName: string;
  authorChannelId?: string;
  textDisplay: string;
  textOriginal: string;
  publishedAt: string;
  likeCount: number;
  updatedAt: string;
  url: string;
}

export const newCommentSchema = {
  type: 'object',
  properties: {
    videoId: {
      type: 'string',
      description: 'YouTube video ID to monitor for new comments',
      examples: ['dQw4w9WgXcQ', 'jNQXAC9IVRw'],
    },
    checkInterval: {
      type: 'number',
      minimum: 60,
      maximum: 3600,
      default: 60,
      description: 'How often to check for new comments (in seconds)',
    },
    filterKeywords: {
      type: 'array',
      items: {
        type: 'string',
      },
      description: 'Only trigger for comments containing these keywords (case-insensitive)',
      examples: [['great', 'awesome'], ['question', 'help']],
    },
    authorFilter: {
      type: 'string',
      description: 'Only trigger for comments from this author name (case-insensitive)',
    },
  },
  required: ['videoId'],
};

export interface ActionCheckResult<T> {
  items: T[];
  cursor?: string;
}

export class NewCommentAction {
  constructor(private adapter: YouTubeServiceAdapter) {}

  async check(
    config: NewCommentConfig,
    lastCommentId?: string
  ): Promise<ActionCheckResult<NewCommentOutput>> {
    try {
      const comments = await this.adapter.getComments({
        videoId: config.videoId,
        maxResults: 50,
        order: 'time',
      });

      const latestCommentId = comments[0]?.id;

      // FIRST RUN: Initialize with most recent comment, don't trigger
      if (!lastCommentId) {
        console.log('[YouTube NewComment] First run - initializing with most recent comment, no triggers');
        return {
          items: [],
          cursor: latestCommentId
        };
      }

      const newComments: NewCommentOutput[] = [];
      let foundLast = false;

      for (const comment of comments) {
        // If we found the last comment, start collecting from next
        if (comment.id === lastCommentId) {
          foundLast = true;
          continue;
        }

        if (!foundLast) {
          continue;
        }

        // Apply keyword filter if specified
        if (config.filterKeywords && config.filterKeywords.length > 0) {
          const textLower = comment.textOriginal.toLowerCase();
          const hasKeyword = config.filterKeywords.some((keyword) =>
            textLower.includes(keyword.toLowerCase())
          );
          if (!hasKeyword) {
            continue;
          }
        }

        // Apply author filter if specified
        if (config.authorFilter) {
          if (
            !comment.authorDisplayName
              .toLowerCase()
              .includes(config.authorFilter.toLowerCase())
          ) {
            continue;
          }
        }

        newComments.push({
          commentId: comment.id,
          videoId: comment.videoId,
          authorDisplayName: comment.authorDisplayName,
          authorChannelId: comment.authorChannelId,
          textDisplay: comment.textDisplay,
          textOriginal: comment.textOriginal,
          publishedAt: comment.publishedAt,
          likeCount: comment.likeCount,
          updatedAt: comment.updatedAt,
          url: `https://www.youtube.com/watch?v=${config.videoId}&lc=${comment.id}`,
        });
      }

      return {
        items: newComments.reverse(), // Oldest first
        cursor: latestCommentId ?? lastCommentId
      };
    } catch (error: any) {
      console.error('Error checking for new comments:', error.message);
      throw error;
    }
  }

  validateConfig(config: any): boolean {
    return typeof config.videoId === 'string' && config.videoId.length > 0;
  }

  static getMetadata() {
    return {
      id: 'youtube_new_comment',
      name: 'New Comment on Video',
      description: 'Triggers when a new comment is posted on a specific YouTube video',
      service: 'youtube',
      category: 'comments',
      configSchema: newCommentSchema,
      outputExample: {
        commentId: 'UgxKREWxIgBxxxxxx',
        videoId: 'dQw4w9WgXcQ',
        authorDisplayName: 'John Doe',
        authorChannelId: 'UCxxxxxx',
        textDisplay: 'Great video!',
        textOriginal: 'Great video!',
        publishedAt: '2025-01-15T10:30:00Z',
        likeCount: 5,
        updatedAt: '2025-01-15T10:30:00Z',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&lc=UgxKREWxIgBxxxxxx',
      },
      requiredScopes: ['https://www.googleapis.com/auth/youtube.readonly'],
    };
  }
}
