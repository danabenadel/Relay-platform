import { YouTubeServiceAdapter, CommentData } from '../youtube-adapter';

export interface PostCommentConfig {
  videoId: string;
  comment: string;
  useTemplates?: boolean;
}

export interface PostCommentOutput {
  success: boolean;
  commentId: string;
  videoId: string;
  text: string;
  url: string;
  publishedAt: string;
}

export const postCommentSchema = {
  type: 'object',
  properties: {
    videoId: {
      type: 'string',
      description: 'YouTube video ID to comment on',
      examples: ['dQw4w9WgXcQ', 'jNQXAC9IVRw'],
    },
    comment: {
      type: 'string',
      description: 'The comment text to post. Supports template variables like {{action.title}}',
      examples: [
        'Great video!',
        'Thanks for the video on {{action.title}}!',
        'New video from {{action.channelTitle}}: {{action.title}}',
      ],
    },
    useTemplates: {
      type: 'boolean',
      default: true,
      description: 'Enable template variable replacement in comment text',
    },
  },
  required: ['videoId', 'comment'],
};

export class PostCommentReaction {
  constructor(private adapter: YouTubeServiceAdapter) {}

  private processTemplates(config: PostCommentConfig, actionData: any): PostCommentConfig {
    if (!config.useTemplates) {
      return config;
    }

    const processed = { ...config };

    // Replace template variables in comment
    processed.comment = this.replaceVariables(config.comment, actionData);

    return processed;
  }

  private replaceVariables(text: string, data: any): string {
    return text.replace(/\{\{action\.(\w+)\}\}/g, (match, key) => {
      const value = data[key];
      return value !== undefined ? String(value) : match;
    });
  }

  async execute(
    config: PostCommentConfig,
    actionData?: any
  ): Promise<PostCommentOutput> {
    try {
      const processedConfig = this.processTemplates(config, actionData || {});

      const comment = await this.adapter.postComment(
        processedConfig.videoId,
        processedConfig.comment
      );

      return {
        success: true,
        commentId: comment.id,
        videoId: comment.videoId,
        text: comment.textOriginal,
        url: `https://www.youtube.com/watch?v=${comment.videoId}&lc=${comment.id}`,
        publishedAt: comment.publishedAt,
      };
    } catch (error: any) {
      console.error('Error posting comment:', error.message);
      return {
        success: false,
        commentId: '',
        videoId: config.videoId,
        text: config.comment,
        url: '',
        publishedAt: '',
      };
    }
  }

  validateConfig(config: any): boolean {
    return (
      typeof config.videoId === 'string' &&
      config.videoId.length > 0 &&
      typeof config.comment === 'string' &&
      config.comment.length > 0
    );
  }

  static getMetadata() {
    return {
      id: 'youtube_post_comment',
      name: 'Post Comment',
      description: 'Posts a comment on a YouTube video',
      service: 'youtube',
      category: 'comments',
      configSchema: postCommentSchema,
      outputExample: {
        success: true,
        commentId: 'UgxKREWxIgBxxxxxx',
        videoId: 'dQw4w9WgXcQ',
        text: 'Great video!',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&lc=UgxKREWxIgBxxxxxx',
        publishedAt: '2025-01-15T10:30:00Z',
      },
      requiredScopes: ['https://www.googleapis.com/auth/youtube.force-ssl'],
    };
  }
}
