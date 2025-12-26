import { google, youtube_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface YouTubeAdapterOptions {
  accessToken: string;
  refreshToken?: string;
  onTokenRefresh?: (newToken: string, expiresAt: Date) => Promise<void>;
}

export interface VideoData {
  id: string;
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
  categoryId?: string;
  liveBroadcastContent?: string;
}

export interface CommentData {
  id: string;
  videoId: string;
  authorDisplayName: string;
  authorChannelId?: string;
  textDisplay: string;
  textOriginal: string;
  publishedAt: string;
  likeCount: number;
  updatedAt: string;
}

export interface SubscriptionData {
  id: string;
  channelId: string;
  channelTitle: string;
  description: string;
  publishedAt: string;
  thumbnails: {
    default?: string;
    medium?: string;
    high?: string;
  };
}

export interface PlaylistData {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  itemCount: number;
  thumbnails: {
    default?: string;
    medium?: string;
    high?: string;
  };
}

// Helper to convert null to undefined
function nullToUndefined<T>(value: T | null | undefined): T | undefined {
  return value === null ? undefined : value;
}

export class YouTubeServiceAdapter {
  private oauth2Client: OAuth2Client;
  private youtube: youtube_v3.Youtube;
  private onTokenRefresh?: (newToken: string, expiresAt: Date) => Promise<void>;

  constructor(options: YouTubeAdapterOptions) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.oauth2Client.setCredentials({
      access_token: options.accessToken,
      refresh_token: options.refreshToken,
    });

    this.youtube = google.youtube({
      version: 'v3',
      auth: this.oauth2Client,
    });

    this.onTokenRefresh = options.onTokenRefresh;

    // Set up token refresh callback
    this.oauth2Client.on('tokens', async (tokens) => {
      if (tokens.access_token && this.onTokenRefresh) {
        const expiresAt = new Date(Date.now() + (tokens.expiry_date || 3600) * 1000);
        await this.onTokenRefresh(tokens.access_token, expiresAt);
      }
    });
  }

  /**
   * List videos from a channel or search query
   */
  async listVideos(params: {
    channelId?: string;
    query?: string;
    maxResults?: number;
    order?: 'date' | 'rating' | 'relevance' | 'title' | 'viewCount';
    publishedAfter?: string;
  }): Promise<VideoData[]> {
    try {
      const searchParams: youtube_v3.Params$Resource$Search$List = {
        part: ['snippet'],
        maxResults: params.maxResults || 10,
        order: params.order || 'date',
        type: ['video'],
      };

      if (params.channelId) {
        searchParams.channelId = params.channelId;
      }

      if (params.query) {
        searchParams.q = params.query;
      }

      if (params.publishedAfter) {
        searchParams.publishedAfter = params.publishedAfter;
      }

      const response = await this.youtube.search.list(searchParams);

      if (!response.data.items || response.data.items.length === 0) {
        return [];
      }

      // Get video IDs to fetch detailed statistics
      const videoIds = response.data.items
        .map(item => item.id?.videoId)
        .filter(Boolean) as string[];

      const videosResponse = await this.youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: videoIds,
      });

      return (videosResponse.data.items || []).map(video => ({
        id: video.id || '',
        title: video.snippet?.title || '',
        description: video.snippet?.description || '',
        channelId: video.snippet?.channelId || '',
        channelTitle: video.snippet?.channelTitle || '',
        publishedAt: video.snippet?.publishedAt || '',
        thumbnails: {
          default: nullToUndefined(video.snippet?.thumbnails?.default?.url),
          medium: nullToUndefined(video.snippet?.thumbnails?.medium?.url),
          high: nullToUndefined(video.snippet?.thumbnails?.high?.url),
        },
        viewCount: nullToUndefined(video.statistics?.viewCount),
        likeCount: nullToUndefined(video.statistics?.likeCount),
        commentCount: nullToUndefined(video.statistics?.commentCount),
        tags: nullToUndefined(video.snippet?.tags),
        categoryId: nullToUndefined(video.snippet?.categoryId),
        liveBroadcastContent: nullToUndefined(video.snippet?.liveBroadcastContent),
      }));
    } catch (error: any) {
      console.error('Error listing videos:', error.message);
      throw new Error(`Failed to list videos: ${error.message}`);
    }
  }

  /**
   * Get video details by ID
   */
  async getVideo(videoId: string): Promise<VideoData | null> {
    try {
      const response = await this.youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: [videoId],
      });

      if (!response.data.items || response.data.items.length === 0) {
        return null;
      }

      const video = response.data.items[0];
      return {
        id: video.id || '',
        title: video.snippet?.title || '',
        description: video.snippet?.description || '',
        channelId: video.snippet?.channelId || '',
        channelTitle: video.snippet?.channelTitle || '',
        publishedAt: video.snippet?.publishedAt || '',
        thumbnails: {
          default: nullToUndefined(video.snippet?.thumbnails?.default?.url),
          medium: nullToUndefined(video.snippet?.thumbnails?.medium?.url),
          high: nullToUndefined(video.snippet?.thumbnails?.high?.url),
        },
        viewCount: nullToUndefined(video.statistics?.viewCount),
        likeCount: nullToUndefined(video.statistics?.likeCount),
        commentCount: nullToUndefined(video.statistics?.commentCount),
        tags: nullToUndefined(video.snippet?.tags),
        categoryId: nullToUndefined(video.snippet?.categoryId),
        liveBroadcastContent: nullToUndefined(video.snippet?.liveBroadcastContent),
      };
    } catch (error: any) {
      console.error('Error getting video:', error.message);
      throw new Error(`Failed to get video: ${error.message}`);
    }
  }

  /**
   * Get comments for a video
   */
  async getComments(params: {
    videoId: string;
    maxResults?: number;
    order?: 'time' | 'relevance';
  }): Promise<CommentData[]> {
    try {
      const response = await this.youtube.commentThreads.list({
        part: ['snippet'],
        videoId: params.videoId,
        maxResults: params.maxResults || 20,
        order: params.order || 'time',
      });

      return (response.data.items || []).map(thread => {
        const comment = thread.snippet?.topLevelComment?.snippet;
        return {
          id: thread.snippet?.topLevelComment?.id || '',
          videoId: params.videoId,
          authorDisplayName: comment?.authorDisplayName || '',
          authorChannelId: nullToUndefined(comment?.authorChannelId?.value),
          textDisplay: comment?.textDisplay || '',
          textOriginal: comment?.textOriginal || '',
          publishedAt: comment?.publishedAt || '',
          likeCount: comment?.likeCount || 0,
          updatedAt: comment?.updatedAt || '',
        };
      });
    } catch (error: any) {
      console.error('Error getting comments:', error.message);
      throw new Error(`Failed to get comments: ${error.message}`);
    }
  }

  /**
   * Post a comment on a video
   */
  async postComment(videoId: string, text: string): Promise<CommentData> {
    try {
      const response = await this.youtube.commentThreads.insert({
        part: ['snippet'],
        requestBody: {
          snippet: {
            videoId,
            topLevelComment: {
              snippet: {
                textOriginal: text,
              },
            },
          },
        },
      });

      const comment = response.data.snippet?.topLevelComment?.snippet;
      return {
        id: response.data.snippet?.topLevelComment?.id || '',
        videoId,
        authorDisplayName: comment?.authorDisplayName || '',
        authorChannelId: nullToUndefined(comment?.authorChannelId?.value),
        textDisplay: comment?.textDisplay || '',
        textOriginal: comment?.textOriginal || '',
        publishedAt: comment?.publishedAt || '',
        likeCount: comment?.likeCount || 0,
        updatedAt: comment?.updatedAt || '',
      };
    } catch (error: any) {
      console.error('Error posting comment:', error.message);
      throw new Error(`Failed to post comment: ${error.message}`);
    }
  }

  /**
   * Like a video
   */
  async likeVideo(videoId: string): Promise<void> {
    try {
      await this.youtube.videos.rate({
        id: videoId,
        rating: 'like',
      });
    } catch (error: any) {
      console.error('Error liking video:', error.message);
      throw new Error(`Failed to like video: ${error.message}`);
    }
  }

  /**
   * Get user's playlists
   */
  async getPlaylists(params: {
    channelId?: string;
    mine?: boolean;
    maxResults?: number;
  }): Promise<PlaylistData[]> {
    try {
      const requestParams: youtube_v3.Params$Resource$Playlists$List = {
        part: ['snippet', 'contentDetails'],
        maxResults: params.maxResults || 25,
      };

      if (params.mine) {
        requestParams.mine = true;
      } else if (params.channelId) {
        requestParams.channelId = params.channelId;
      } else {
        requestParams.mine = true; // Default to user's playlists
      }

      const response = await this.youtube.playlists.list(requestParams);

      return (response.data.items || []).map(playlist => ({
        id: playlist.id || '',
        title: playlist.snippet?.title || '',
        description: playlist.snippet?.description || '',
        channelId: playlist.snippet?.channelId || '',
        channelTitle: playlist.snippet?.channelTitle || '',
        publishedAt: playlist.snippet?.publishedAt || '',
        itemCount: playlist.contentDetails?.itemCount || 0,
        thumbnails: {
          default: nullToUndefined(playlist.snippet?.thumbnails?.default?.url),
          medium: nullToUndefined(playlist.snippet?.thumbnails?.medium?.url),
          high: nullToUndefined(playlist.snippet?.thumbnails?.high?.url),
        },
      }));
    } catch (error: any) {
      console.error('Error getting playlists:', error.message);
      throw new Error(`Failed to get playlists: ${error.message}`);
    }
  }

  /**
   * Create a new playlist
   */
  async createPlaylist(params: {
    title: string;
    description?: string;
    privacyStatus?: 'private' | 'public' | 'unlisted';
  }): Promise<PlaylistData> {
    try {
      const response = await this.youtube.playlists.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: params.title,
            description: params.description || '',
          },
          status: {
            privacyStatus: params.privacyStatus || 'private',
          },
        },
      });

      return {
        id: response.data.id || '',
        title: response.data.snippet?.title || '',
        description: response.data.snippet?.description || '',
        channelId: response.data.snippet?.channelId || '',
        channelTitle: response.data.snippet?.channelTitle || '',
        publishedAt: response.data.snippet?.publishedAt || '',
        itemCount: 0,
        thumbnails: {
          default: nullToUndefined(response.data.snippet?.thumbnails?.default?.url),
          medium: nullToUndefined(response.data.snippet?.thumbnails?.medium?.url),
          high: nullToUndefined(response.data.snippet?.thumbnails?.high?.url),
        },
      };
    } catch (error: any) {
      console.error('Error creating playlist:', error.message);
      throw new Error(`Failed to create playlist: ${error.message}`);
    }
  }

  /**
   * Add video to playlist
   */
  async addToPlaylist(playlistId: string, videoId: string): Promise<void> {
    try {
      await this.youtube.playlistItems.insert({
        part: ['snippet'],
        requestBody: {
          snippet: {
            playlistId,
            resourceId: {
              kind: 'youtube#video',
              videoId,
            },
          },
        },
      });
    } catch (error: any) {
      console.error('Error adding to playlist:', error.message);
      throw new Error(`Failed to add to playlist: ${error.message}`);
    }
  }

  /**
   * Get user's subscriptions
   */
  async getSubscriptions(params: {
    maxResults?: number;
    order?: 'alphabetical' | 'relevance' | 'unread';
  }): Promise<SubscriptionData[]> {
    try {
      const response = await this.youtube.subscriptions.list({
        part: ['snippet'],
        mine: true,
        maxResults: params.maxResults || 25,
        order: params.order || 'relevance',
      });

      return (response.data.items || []).map(sub => ({
        id: sub.id || '',
        channelId: sub.snippet?.resourceId?.channelId || '',
        channelTitle: sub.snippet?.title || '',
        description: sub.snippet?.description || '',
        publishedAt: sub.snippet?.publishedAt || '',
        thumbnails: {
          default: nullToUndefined(sub.snippet?.thumbnails?.default?.url),
          medium: nullToUndefined(sub.snippet?.thumbnails?.medium?.url),
          high: nullToUndefined(sub.snippet?.thumbnails?.high?.url),
        },
      }));
    } catch (error: any) {
      console.error('Error getting subscriptions:', error.message);
      throw new Error(`Failed to get subscriptions: ${error.message}`);
    }
  }

  /**
   * Subscribe to a channel
   */
  async subscribeToChannel(channelId: string): Promise<SubscriptionData> {
    try {
      const response = await this.youtube.subscriptions.insert({
        part: ['snippet'],
        requestBody: {
          snippet: {
            resourceId: {
              kind: 'youtube#channel',
              channelId,
            },
          },
        },
      });

      return {
        id: response.data.id || '',
        channelId: response.data.snippet?.resourceId?.channelId || '',
        channelTitle: response.data.snippet?.title || '',
        description: response.data.snippet?.description || '',
        publishedAt: response.data.snippet?.publishedAt || '',
        thumbnails: {
          default: nullToUndefined(response.data.snippet?.thumbnails?.default?.url),
          medium: nullToUndefined(response.data.snippet?.thumbnails?.medium?.url),
          high: nullToUndefined(response.data.snippet?.thumbnails?.high?.url),
        },
      };
    } catch (error: any) {
      console.error('Error subscribing to channel:', error.message);
      throw new Error(`Failed to subscribe to channel: ${error.message}`);
    }
  }

  /**
   * Get live broadcasts
   */
  async getLiveBroadcasts(params: {
    channelId?: string;
    broadcastStatus?: 'active' | 'upcoming' | 'completed';
    maxResults?: number;
  }): Promise<VideoData[]> {
    try {
      const searchParams: youtube_v3.Params$Resource$Search$List = {
        part: ['snippet'],
        maxResults: params.maxResults || 10,
        type: ['video'],
        eventType: params.broadcastStatus === 'active' ? 'live' : 'upcoming',
      };

      if (params.channelId) {
        searchParams.channelId = params.channelId;
      }

      const response = await this.youtube.search.list(searchParams);

      if (!response.data.items || response.data.items.length === 0) {
        return [];
      }

      const videoIds = response.data.items
        .map(item => item.id?.videoId)
        .filter(Boolean) as string[];

      const videosResponse = await this.youtube.videos.list({
        part: ['snippet', 'statistics', 'liveStreamingDetails'],
        id: videoIds,
      });

      return (videosResponse.data.items || []).map(video => ({
        id: video.id || '',
        title: video.snippet?.title || '',
        description: video.snippet?.description || '',
        channelId: video.snippet?.channelId || '',
        channelTitle: video.snippet?.channelTitle || '',
        publishedAt: video.snippet?.publishedAt || '',
        thumbnails: {
          default: nullToUndefined(video.snippet?.thumbnails?.default?.url),
          medium: nullToUndefined(video.snippet?.thumbnails?.medium?.url),
          high: nullToUndefined(video.snippet?.thumbnails?.high?.url),
        },
        viewCount: nullToUndefined(video.statistics?.viewCount),
        likeCount: nullToUndefined(video.statistics?.likeCount),
        commentCount: nullToUndefined(video.statistics?.commentCount),
        tags: nullToUndefined(video.snippet?.tags),
        categoryId: nullToUndefined(video.snippet?.categoryId),
        liveBroadcastContent: nullToUndefined(video.snippet?.liveBroadcastContent),
      }));
    } catch (error: any) {
      console.error('Error getting live broadcasts:', error.message);
      throw new Error(`Failed to get live broadcasts: ${error.message}`);
    }
  }

  /**
   * Get user's liked videos
   */
  async getLikedVideos(maxResults: number = 10): Promise<VideoData[]> {
    try {
      const response = await this.youtube.videos.list({
        part: ['snippet', 'statistics'],
        myRating: 'like',
        maxResults,
      });

      return (response.data.items || []).map(video => ({
        id: video.id || '',
        title: video.snippet?.title || '',
        description: video.snippet?.description || '',
        channelId: video.snippet?.channelId || '',
        channelTitle: video.snippet?.channelTitle || '',
        publishedAt: video.snippet?.publishedAt || '',
        thumbnails: {
          default: nullToUndefined(video.snippet?.thumbnails?.default?.url),
          medium: nullToUndefined(video.snippet?.thumbnails?.medium?.url),
          high: nullToUndefined(video.snippet?.thumbnails?.high?.url),
        },
        viewCount: nullToUndefined(video.statistics?.viewCount),
        likeCount: nullToUndefined(video.statistics?.likeCount),
        commentCount: nullToUndefined(video.statistics?.commentCount),
        tags: nullToUndefined(video.snippet?.tags),
        categoryId: nullToUndefined(video.snippet?.categoryId),
        liveBroadcastContent: nullToUndefined(video.snippet?.liveBroadcastContent),
      }));
    } catch (error: any) {
      console.error('Error getting liked videos:', error.message);
      throw new Error(`Failed to get liked videos: ${error.message}`);
    }
  }
}
