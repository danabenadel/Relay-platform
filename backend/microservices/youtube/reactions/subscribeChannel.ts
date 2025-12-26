import { YouTubeServiceAdapter, SubscriptionData } from '../youtube-adapter';

export interface SubscribeChannelConfig {
  channelId: string;
  useTemplates?: boolean;
}

export interface SubscribeChannelOutput {
  success: boolean;
  subscriptionId: string;
  channelId: string;
  channelTitle: string;
  message: string;
  channelUrl: string;
}

export const subscribeChannelSchema = {
  type: 'object',
  properties: {
    channelId: {
      type: 'string',
      description: 'YouTube channel ID to subscribe to. Supports template variables like {{action.channelId}}',
      examples: ['UCuAXFkgsw1L7xaCfnd5JJOw', '{{action.channelId}}'],
    },
    useTemplates: {
      type: 'boolean',
      default: true,
      description: 'Enable template variable replacement',
    },
  },
  required: ['channelId'],
};

export class SubscribeChannelReaction {
  constructor(private adapter: YouTubeServiceAdapter) {}

  private processTemplates(
    config: SubscribeChannelConfig,
    actionData: any
  ): SubscribeChannelConfig {
    if (!config.useTemplates) {
      return config;
    }

    const processed = { ...config };

    // Replace template variables in channelId
    processed.channelId = this.replaceVariables(config.channelId, actionData);

    return processed;
  }

  private replaceVariables(text: string, data: any): string {
    return text.replace(/\{\{action\.(\w+)\}\}/g, (match, key) => {
      const value = data[key];
      return value !== undefined ? String(value) : match;
    });
  }

  async execute(
    config: SubscribeChannelConfig,
    actionData?: any
  ): Promise<SubscribeChannelOutput> {
    try {
      const processedConfig = this.processTemplates(config, actionData || {});

      const subscription = await this.adapter.subscribeToChannel(
        processedConfig.channelId
      );

      return {
        success: true,
        subscriptionId: subscription.id,
        channelId: subscription.channelId,
        channelTitle: subscription.channelTitle,
        message: `Successfully subscribed to ${subscription.channelTitle}`,
        channelUrl: `https://www.youtube.com/channel/${subscription.channelId}`,
      };
    } catch (error: any) {
      console.error('Error subscribing to channel:', error.message);
      return {
        success: false,
        subscriptionId: '',
        channelId: config.channelId,
        channelTitle: '',
        message: `Failed to subscribe: ${error.message}`,
        channelUrl: `https://www.youtube.com/channel/${config.channelId}`,
      };
    }
  }

  validateConfig(config: any): boolean {
    return typeof config.channelId === 'string' && config.channelId.length > 0;
  }

  static getMetadata() {
    return {
      id: 'youtube_subscribe_channel',
      name: 'Subscribe to Channel',
      description: 'Subscribes to a YouTube channel',
      service: 'youtube',
      category: 'subscriptions',
      configSchema: subscribeChannelSchema,
      outputExample: {
        success: true,
        subscriptionId: 'UCxxxxxx-sub-id',
        channelId: 'UCuAXFkgsw1L7xaCfnd5JJOw',
        channelTitle: 'Awesome Channel',
        message: 'Successfully subscribed to Awesome Channel',
        channelUrl: 'https://www.youtube.com/channel/UCuAXFkgsw1L7xaCfnd5JJOw',
      },
      requiredScopes: ['https://www.googleapis.com/auth/youtube.force-ssl'],
    };
  }
}
