import { YouTubeServiceAdapter } from '../youtube-adapter';

export interface NewSubscriberConfig {
  checkInterval?: number;
  channelFilter?: string;
}

export interface NewSubscriberOutput {
  subscriptionId: string;
  channelId: string;
  channelTitle: string;
  description: string;
  publishedAt: string;
  thumbnails: {
    default?: string;
    medium?: string;
    high?: string;
  };
  channelUrl: string;
}

export interface ActionCheckResult<T> {
  items: T[];
  cursor?: string;
}

export const newSubscriberSchema = {
  type: 'object',
  properties: {
    checkInterval: {
      type: 'number',
      minimum: 60,
      maximum: 3600,
      default: 60,
      description: 'How often to check for new subscriptions (in seconds)',
    },
    channelFilter: {
      type: 'string',
      description: 'Only trigger for subscriptions to channels matching this name (case-insensitive)',
    },
  },
};

export class NewSubscriberAction {
  constructor(private adapter: YouTubeServiceAdapter) {}

  async check(
    config: NewSubscriberConfig,
    lastSubscriptionId?: string
  ): Promise<ActionCheckResult<NewSubscriberOutput>> {
    try {
      const subscriptions = await this.adapter.getSubscriptions({
        maxResults: 50,
        order: 'relevance',
      });

      const latestSubscriptionId = subscriptions[0]?.id;

      // FIRST RUN: Initialize with most recent subscription, don't trigger
      if (!lastSubscriptionId) {
        console.log('[YouTube NewSubscriber] First run - initializing with most recent subscription, no triggers');
        return {
          items: [],
          cursor: latestSubscriptionId
        };
      }

      const newSubscriptions: NewSubscriberOutput[] = [];

      for (const subscription of subscriptions) {
        // Stop when we reach the last known subscription
        if (subscription.id === lastSubscriptionId) {
          break;
        }

        // Apply channel filter if specified
        if (config.channelFilter) {
          if (
            !subscription.channelTitle
              .toLowerCase()
              .includes(config.channelFilter.toLowerCase())
          ) {
            continue;
          }
        }

        console.log(`[YouTube NewSubscriber] New subscription detected: ${subscription.channelTitle} (${subscription.channelId})`);

        newSubscriptions.push({
          subscriptionId: subscription.id,
          channelId: subscription.channelId,
          channelTitle: subscription.channelTitle,
          description: subscription.description,
          publishedAt: subscription.publishedAt,
          thumbnails: subscription.thumbnails,
          channelUrl: `https://www.youtube.com/channel/${subscription.channelId}`,
        });
      }

      return {
        items: newSubscriptions.reverse(), // Oldest first
        cursor: latestSubscriptionId ?? lastSubscriptionId
      };
    } catch (error: any) {
      console.error('Error checking for new subscriptions:', error.message);
      throw error;
    }
  }

  validateConfig(config: any): boolean {
    return true; // No required fields
  }

  static getMetadata() {
    return {
      id: 'youtube_new_subscriber',
      name: 'New Subscription',
      description: 'Triggers when you subscribe to a new YouTube channel',
      service: 'youtube',
      category: 'subscriptions',
      configSchema: newSubscriberSchema,
      outputExample: {
        subscriptionId: 'UCxxxxxx-sub-id',
        channelId: 'UCuAXFkgsw1L7xaCfnd5JJOw',
        channelTitle: 'Amazing Channel',
        description: 'This channel creates awesome content',
        publishedAt: '2025-01-15T10:30:00Z',
        thumbnails: {
          default: 'https://yt3.ggpht.com/default.jpg',
          medium: 'https://yt3.ggpht.com/medium.jpg',
          high: 'https://yt3.ggpht.com/high.jpg',
        },
        channelUrl: 'https://www.youtube.com/channel/UCuAXFkgsw1L7xaCfnd5JJOw',
      },
      requiredScopes: ['https://www.googleapis.com/auth/youtube.readonly'],
    };
  }
}
