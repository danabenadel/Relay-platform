import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const timerService = await prisma.service.upsert({
    where: { name: 'timer' },
    update: {},
    create: {
      name: 'timer',
      description: 'Timer service for scheduled actions',
      type: 'internal'
    }
  });

  const consoleService = await prisma.service.upsert({
    where: { name: 'console' },
    update: {},
    create: {
      name: 'console',
      description: 'Console logging service',
      type: 'internal'
    }
  });

  const discordService = await prisma.service.upsert({
    where: { name: 'discord' },
    update: {},
    create: {
      name: 'discord',
      description: 'Discord communication platform with OAuth',
      type: 'oauth'
    }
  });

  const telegramService = await prisma.service.upsert({
    where: { name: 'telegram' },
    update: {},
    create: {
      name: 'telegram',
      description: 'Telegram bot automation service',
      type: 'bot'
    }
  });

  const spotifyService = await prisma.service.upsert({
    where: { name: 'spotify' },
    update: {},
    create: {
      name: 'spotify',
      description: 'Spotify music streaming service',
      type: 'oauth'
    }
  });

  const googleService = await prisma.service.upsert({
    where: { name: 'google' },
    update: {},
    create: {
      name: 'google',
      description: 'Google services (Gmail & Drive)',
      type: 'oauth'
    }
  });

  const redditService = await prisma.service.upsert({
    where: { name: 'reddit' },
    update: {},
    create: {
      name: 'reddit',
      description: 'Reddit social platform integration',
      type: 'oauth'
    }
  });

  const githubService = await prisma.service.upsert({
    where: { name: 'github' },
    update: {},
    create: {
      name: 'github',
      description: 'GitHub repository and collaboration platform',
      type: 'oauth'
    }
  });

  const onedriveService = await prisma.service.upsert({
    where: { name: 'onedrive' },
    update: {},
    create: {
      name: 'onedrive',
      description: 'Microsoft OneDrive cloud storage',
      type: 'oauth'
    }
  });

  const gitlabService = await prisma.service.upsert({
    where: { name: 'gitlab' },
    update: {},
    create: {
      name: 'gitlab',
      description: 'GitLab DevOps platform for version control and CI/CD',
      type: 'oauth'
    }
  });

  const youtubeService = await prisma.service.upsert({
    where: { name: 'youtube' },
    update: {},
    create: {
      name: 'youtube',
      description: 'YouTube video platform integration',
      type: 'oauth'
    }
  });

  const notionService = await prisma.service.upsert({
    where: { name: 'notion' },
    update: {},
    create: {
      name: 'notion',
      description: 'Notion workspace and database automation',
      type: 'oauth'
    }
  });

  const openaiService = await prisma.service.upsert({
    where: { name: 'openai' },
    update: {
      type: 'api',
      description: 'OpenAI GPT text generation and processing'
    },
    create: {
      name: 'openai',
      description: 'OpenAI GPT text generation and processing',
      type: 'api'
    }
  });

  const timerActionTime = await prisma.action.findFirst({
    where: { serviceId: timerService.id, name: 'timer_time' }
  }) || await prisma.action.create({
    data: {
      name: 'timer_time',
      description: 'Triggers at a specific time (HH:MM)',
      serviceId: timerService.id
    }
  });

  const timerActionDate = await prisma.action.findFirst({
    where: { serviceId: timerService.id, name: 'timer_date' }
  }) || await prisma.action.create({
    data: {
      name: 'timer_date',
      description: 'Triggers at a specific date (DD/MM)',
      serviceId: timerService.id
    }
  });

  const consoleReactionLog = await prisma.reaction.findFirst({
    where: { serviceId: consoleService.id, name: 'console_log' }
  }) || await prisma.reaction.create({
    data: {
      name: 'console_log',
      description: 'Logs a message to console',
      serviceId: consoleService.id
    }
  });

  const discordReactionWebhook = await prisma.reaction.findFirst({
    where: { serviceId: discordService.id, name: 'discord_webhook' }
  }) || await prisma.reaction.create({
    data: {
      name: 'discord_webhook',
      description: 'Send a message via Discord webhook',
      serviceId: discordService.id
    }
  });

  // ==================== SPOTIFY ACTIONS ====================

  const spotifyActionNewTrackInPlaylist = await prisma.action.findFirst({
    where: { serviceId: spotifyService.id, name: 'new_track_in_playlist' }
  }) || await prisma.action.create({
    data: {
      name: 'new_track_in_playlist',
      description: 'Triggers when a new track is added to a specific playlist',
      serviceId: spotifyService.id,
      params: [
        {
          name: 'playlist_id',
          description: 'Spotify playlist ID or URI (e.g., 37i9dQZF1DXcBWIGoYBM5M)',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const spotifyActionNewSavedTrack = await prisma.action.findFirst({
    where: { serviceId: spotifyService.id, name: 'new_saved_track' }
  }) || await prisma.action.create({
    data: {
      name: 'new_saved_track',
      description: 'Triggers when user saves a new track to their library',
      serviceId: spotifyService.id,
      params: []
    }
  });

  const spotifyActionSongPlaying = await prisma.action.findFirst({
    where: { serviceId: spotifyService.id, name: 'song_playing' }
  }) || await prisma.action.create({
    data: {
      name: 'song_playing',
      description: 'Triggers when a specific song is currently playing',
      serviceId: spotifyService.id,
      params: [
        {
          name: 'track_id',
          description: 'Spotify track ID or URI (e.g., 11dFghVXANMlKmJXsNCbNl)',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const spotifyActionPlaylistUpdated = await prisma.action.findFirst({
    where: { serviceId: spotifyService.id, name: 'playlist_updated' }
  }) || await prisma.action.create({
    data: {
      name: 'playlist_updated',
      description: 'Triggers when a playlist is modified',
      serviceId: spotifyService.id,
      params: [
        {
          name: 'playlist_id',
          description: 'Spotify playlist ID or URI (e.g., 37i9dQZF1DXcBWIGoYBM5M)',
          type: 'string',
          required: true
        }
      ]
    }
  });

  // ==================== SPOTIFY REACTIONS ====================

  const spotifyReactionPlayTrack = await prisma.reaction.findFirst({
    where: { serviceId: spotifyService.id, name: 'play_track' }
  }) || await prisma.reaction.create({
    data: {
      name: 'play_track',
      description: 'Play a specific track',
      serviceId: spotifyService.id,
      params: [
        {
          name: 'track_id',
          description: 'Spotify track ID, URI, or use {{trackId}} from action',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const spotifyReactionAddToPlaylist = await prisma.reaction.findFirst({
    where: { serviceId: spotifyService.id, name: 'add_to_playlist' }
  }) || await prisma.reaction.create({
    data: {
      name: 'add_to_playlist',
      description: 'Add a track to a playlist',
      serviceId: spotifyService.id,
      params: [
        {
          name: 'playlist_id',
          description: 'Spotify playlist ID, URI, or use {{playlistId}} from action',
          type: 'string',
          required: true
        },
        {
          name: 'track_id',
          description: 'Spotify track ID, URI, or use {{trackId}} from action',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const spotifyReactionCreatePlaylist = await prisma.reaction.findFirst({
    where: { serviceId: spotifyService.id, name: 'create_playlist' }
  }) || await prisma.reaction.create({
    data: {
      name: 'create_playlist',
      description: 'Create a new playlist',
      serviceId: spotifyService.id,
      params: [
        {
          name: 'playlist_name',
          description: 'Playlist name (can use {{trackName}}, {{artist}}, etc.)',
          type: 'string',
          required: true
        },
        {
          name: 'description',
          description: 'Playlist description (optional)',
          type: 'string',
          required: false
        },
        {
          name: 'public',
          description: 'Make playlist public (true/false)',
          type: 'boolean',
          required: false
        }
      ]
    }
  });

  const spotifyReactionSaveTrack = await prisma.reaction.findFirst({
    where: { serviceId: spotifyService.id, name: 'save_track' }
  }) || await prisma.reaction.create({
    data: {
      name: 'save_track',
      description: 'Save a track to user library',
      serviceId: spotifyService.id,
      params: [
        {
          name: 'track_id',
          description: 'Spotify track ID, URI, or use {{trackId}} from action',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const spotifyReactionPausePlayback = await prisma.reaction.findFirst({
    where: { serviceId: spotifyService.id, name: 'pause_playback' }
  }) || await prisma.reaction.create({
    data: {
      name: 'pause_playback',
      description: 'Pause current playback',
      serviceId: spotifyService.id,
      params: []
    }
  });

  const spotifyReactionResumePlayback = await prisma.reaction.findFirst({
    where: { serviceId: spotifyService.id, name: 'resume_playback' }
  }) || await prisma.reaction.create({
    data: {
      name: 'resume_playback',
      description: 'Resume playback',
      serviceId: spotifyService.id,
      params: []
    }
  });

  const spotifyReactionNextTrack = await prisma.reaction.findFirst({
    where: { serviceId: spotifyService.id, name: 'next_track' }
  }) || await prisma.reaction.create({
    data: {
      name: 'next_track',
      description: 'Skip to next track',
      serviceId: spotifyService.id,
      params: []
    }
  });

  const spotifyReactionPreviousTrack = await prisma.reaction.findFirst({
    where: { serviceId: spotifyService.id, name: 'previous_track' }
  }) || await prisma.reaction.create({
    data: {
      name: 'previous_track',
      description: 'Go to previous track',
      serviceId: spotifyService.id,
      params: []
    }
  });

  const spotifyReactionSetVolume = await prisma.reaction.findFirst({
    where: { serviceId: spotifyService.id, name: 'set_volume' }
  }) || await prisma.reaction.create({
    data: {
      name: 'set_volume',
      description: 'Set playback volume (0-100)',
      serviceId: spotifyService.id,
      params: [
        {
          name: 'volume',
          description: 'Volume level (0-100)',
          type: 'number',
          required: true
        }
      ]
    }
  });

  const spotifyReactionShuffleToggle = await prisma.reaction.findFirst({
    where: { serviceId: spotifyService.id, name: 'shuffle_toggle' }
  }) || await prisma.reaction.create({
    data: {
      name: 'shuffle_toggle',
      description: 'Toggle shuffle mode',
      serviceId: spotifyService.id,
      params: [
      {
          name: 'state',
          description: 'Shuffle state (true/false)',
          type: 'boolean',
          required: true
        }
      ]
    }
  });

  // ==================== REDDIT ACTIONS ====================

  const redditActionNewPostInSubreddit = await prisma.action.findFirst({
    where: { serviceId: redditService.id, name: 'new_post_in_subreddit' }
  }) || await prisma.action.create({
    data: {
      name: 'new_post_in_subreddit',
      description: 'Triggers when a new post is published in a subreddit',
      serviceId: redditService.id,
      params: [
        {
          name: 'subreddit',
          description: 'Name of the subreddit to monitor (e.g., AskReddit)',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const redditActionNewCommentOnPost = await prisma.action.findFirst({
    where: { serviceId: redditService.id, name: 'new_comment_on_post' }
  }) || await prisma.action.create({
    data: {
      name: 'new_comment_on_post',
      description: 'Triggers when a new comment is added to a post',
      serviceId: redditService.id,
      params: [
        {
          name: 'postId',
          description: 'Reddit post ID to monitor for new comments',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const redditActionNewMessage = await prisma.action.findFirst({
    where: { serviceId: redditService.id, name: 'new_message' }
  }) || await prisma.action.create({
    data: {
      name: 'new_message',
      description: 'Triggers when a new private message is received',
      serviceId: redditService.id,
      params: []
    }
  });

  const redditActionPostScoreThreshold = await prisma.action.findFirst({
    where: { serviceId: redditService.id, name: 'post_score_threshold' }
  }) || await prisma.action.create({
    data: {
      name: 'post_score_threshold',
      description: 'Triggers when a post reaches a certain score',
      serviceId: redditService.id,
      params: [
        {
          name: 'postId',
          description: 'Reddit post ID to monitor',
          type: 'string',
          required: true
        },
        {
          name: 'threshold',
          description: 'Score threshold (e.g., 1000)',
          type: 'number',
          required: true
        }
      ]
    }
  });

  const redditActionNewSubscriberMilestone = await prisma.action.findFirst({
    where: { serviceId: redditService.id, name: 'new_subscriber_milestone' }
  }) || await prisma.action.create({
    data: {
      name: 'new_subscriber_milestone',
      description: 'Triggers when a subreddit reaches a subscriber milestone',
      serviceId: redditService.id,
      params: [
        {
          name: 'subreddit',
          description: 'Name of the subreddit to monitor',
          type: 'string',
          required: true
        },
        {
          name: 'milestone',
          description: 'Subscriber milestone (e.g., 100000)',
          type: 'number',
          required: true
        }
      ]
    }
  });

  // ==================== REDDIT REACTIONS ====================

  const redditReactionSubmitPost = await prisma.reaction.findFirst({
    where: { serviceId: redditService.id, name: 'submit_post' }
  }) || await prisma.reaction.create({
    data: {
      name: 'submit_post',
      description: 'Create a new post in a subreddit',
      serviceId: redditService.id,
      params: [
        {
          name: 'subreddit',
          description: 'Subreddit name (e.g., AskReddit)',
          type: 'string',
          required: true
        },
        {
          name: 'title',
          description: 'Post title',
          type: 'string',
          required: true
        },
        {
          name: 'text',
          description: 'Post content (for text posts) or URL (for link posts)',
          type: 'string',
          required: true
        },
        {
          name: 'kind',
          description: 'Post type: "self" for text or "link" for URL (default: self)',
          type: 'string',
          required: false
        }
      ]
    }
  });

  const redditReactionSubmitComment = await prisma.reaction.findFirst({
    where: { serviceId: redditService.id, name: 'submit_comment' }
  }) || await prisma.reaction.create({
    data: {
      name: 'submit_comment',
      description: 'Post a comment on a post or another comment',
      serviceId: redditService.id,
      params: [
        {
          name: 'thingId',
          description: 'Post or comment ID (e.g., t3_abc123 for post, t1_def456 for comment)',
          type: 'string',
          required: true
        },
        {
          name: 'text',
          description: 'Comment text',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const redditReactionUpvote = await prisma.reaction.findFirst({
    where: { serviceId: redditService.id, name: 'upvote' }
  }) || await prisma.reaction.create({
    data: {
      name: 'upvote',
      description: 'Upvote a post or comment',
      serviceId: redditService.id,
      params: [
        {
          name: 'thingId',
          description: 'Post or comment ID to upvote (e.g., t3_abc123)',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const redditReactionSavePost = await prisma.reaction.findFirst({
    where: { serviceId: redditService.id, name: 'save_post' }
  }) || await prisma.reaction.create({
    data: {
      name: 'save_post',
      description: 'Save a post to favorites',
      serviceId: redditService.id,
      params: [
        {
          name: 'thingId',
          description: 'Post ID to save (e.g., t3_abc123)',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const redditReactionSubscribeSubreddit = await prisma.reaction.findFirst({
    where: { serviceId: redditService.id, name: 'subscribe_subreddit' }
  }) || await prisma.reaction.create({
    data: {
      name: 'subscribe_subreddit',
      description: 'Subscribe to a subreddit',
      serviceId: redditService.id,
      params: [
        {
          name: 'subreddit',
          description: 'Subreddit name to subscribe to (e.g., programming)',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const redditReactionUnsubscribeSubreddit = await prisma.reaction.findFirst({
    where: { serviceId: redditService.id, name: 'unsubscribe_subreddit' }
  }) || await prisma.reaction.create({
    data: {
      name: 'unsubscribe_subreddit',
      description: 'Unsubscribe from a subreddit',
      serviceId: redditService.id,
      params: [
        {
          name: 'subreddit',
          description: 'Subreddit name to unsubscribe from (e.g., programming)',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const redditReactionSendMessage = await prisma.reaction.findFirst({
    where: { serviceId: redditService.id, name: 'send_message' }
  }) || await prisma.reaction.create({
    data: {
      name: 'send_message',
      description: 'Send a private message to a user',
      serviceId: redditService.id,
      params: [
        {
          name: 'to',
          description: 'Username of the recipient (without u/)',
          type: 'string',
          required: true
        },
        {
          name: 'subject',
          description: 'Message subject',
          type: 'string',
          required: true
        },
        {
          name: 'text',
          description: 'Message content',
          type: 'string',
          required: true
        }
      ]
    }
  });

  // ==================== DISCORD ACTIONS ====================

  const discordActionNewMessageInChannel = await prisma.action.findFirst({
    where: { serviceId: discordService.id, name: 'new_message_in_channel' }
  }) || await prisma.action.create({
    data: {
      name: 'new_message_in_channel',
      description: 'Triggers when a new message is posted in a specific channel',
      serviceId: discordService.id,
      params: [
        {
          name: 'channelId',
          description: 'Discord channel ID (right-click channel → Copy ID)',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const discordActionNewMemberJoined = await prisma.action.findFirst({
    where: { serviceId: discordService.id, name: 'new_member_joined' }
  }) || await prisma.action.create({
    data: {
      name: 'new_member_joined',
      description: 'Triggers when a new member joins the server',
      serviceId: discordService.id,
      params: [
        {
          name: 'guildId',
          description: 'Discord server (guild) ID',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const discordActionMessageReactionAdded = await prisma.action.findFirst({
    where: { serviceId: discordService.id, name: 'message_reaction_added' }
  }) || await prisma.action.create({
    data: {
      name: 'message_reaction_added',
      description: 'Triggers when a reaction is added to a message',
      serviceId: discordService.id,
      params: [
        {
          name: 'channelId',
          description: 'Discord channel ID',
          type: 'string',
          required: true
        },
        {
          name: 'messageId',
          description: 'Message ID to watch for reactions',
          type: 'string',
          required: true
        }
      ]
    }
  });

  // ==================== GOOGLE ACTIONS ====================

  const googleActionNewEmailReceived = await prisma.action.findFirst({
    where: { serviceId: googleService.id, name: 'google_new_email_received' }
  }) || await prisma.action.create({
    data: {
      name: 'google_new_email_received',
      description: 'Triggers when a new email is received in Gmail',
      serviceId: googleService.id,
      params: []
    }
  });

  const googleActionEmailFromSender = await prisma.action.findFirst({
    where: { serviceId: googleService.id, name: 'google_email_from_sender' }
  }) || await prisma.action.create({
    data: {
      name: 'google_email_from_sender',
      description: 'Triggers when an email from a specific sender is received',
      serviceId: googleService.id,
      params: [
        {
          name: 'sender_email',
          description: 'Email address of the sender to filter (example: user@example.com)',
          type: 'string',
          required: true
        },
        {
          name: 'label',
          description: 'Gmail label to monitor (optional)',
          type: 'string',
          required: false
        }
      ]
    }
  });

  const googleActionEmailWithAttachment = await prisma.action.findFirst({
    where: { serviceId: googleService.id, name: 'google_email_with_attachment' }
  }) || await prisma.action.create({
    data: {
      name: 'google_email_with_attachment',
      description: 'Triggers when an email with attachment is received',
      serviceId: googleService.id,
      params: [
        {
          name: 'label',
          description: 'Gmail label to monitor (optional)',
          type: 'string',
          required: false
        },
        {
          name: 'min_attachment_size',
          description: 'Minimum attachment size in KB to trigger the action (optional)',
          type: 'number',
          required: false
        }
      ]
    }
  });

  const googleActionNewDriveFile = await prisma.action.findFirst({
    where: { serviceId: googleService.id, name: 'google_new_drive_file' }
  }) || await prisma.action.create({
    data: {
      name: 'google_new_drive_file',
      description: 'Triggers when a new file is added to Google Drive',
      serviceId: googleService.id,
      params: [
        {
          name: 'folder_id',
          description: 'ID of the Drive folder to monitor (leave empty for entire Drive)',
          type: 'string',
          required: false
        },
        {
          name: 'mime_type',
          description: 'Filter by MIME type (example: application/pdf)',
          type: 'string',
          required: false
        }
      ]
    }
  });

  // ==================== GOOGLE REACTIONS ====================

  const googleReactionSendEmail = await prisma.reaction.findFirst({
    where: { serviceId: googleService.id, name: 'google_send_email' }
  }) || await prisma.reaction.create({
    data: {
      name: 'google_send_email',
      description: 'Send an email via Gmail',
      serviceId: googleService.id,
      params: [
        {
          name: 'recipient',
          description: 'Recipient email address',
          type: 'string',
          required: true
        },
        {
          name: 'subject',
          description: 'Email subject',
          type: 'string',
          required: true
        },
        {
          name: 'body',
          description: 'Email body (HTML allowed)',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const googleReactionReplyToEmail = await prisma.reaction.findFirst({
    where: { serviceId: googleService.id, name: 'google_reply_to_email' }
  }) || await prisma.reaction.create({
    data: {
      name: 'google_reply_to_email',
      description: 'Reply to an email automatically',
      serviceId: googleService.id,
      params: [
        {
          name: 'thread_id',
          description: 'Gmail thread ID to reply to',
          type: 'string',
          required: true
        },
        {
          name: 'message',
          description: 'Reply message body',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const googleReactionSaveAttachmentToDrive = await prisma.reaction.findFirst({
    where: { serviceId: googleService.id, name: 'google_save_attachment_to_drive' }
  }) || await prisma.reaction.create({
    data: {
      name: 'google_save_attachment_to_drive',
      description: 'Save email attachment to Google Drive',
      serviceId: googleService.id,
      params: [
        {
          name: 'thread_id',
          description: 'Gmail thread ID containing the attachment',
          type: 'string',
          required: true
        },
        {
          name: 'folder_id',
          description: 'Drive folder ID where the attachment should be saved',
          type: 'string',
          required: false
        },
        {
          name: 'file_name',
          description: 'Override the output file name (optional)',
          type: 'string',
          required: false
        }
      ]
    }
  });

  // ==================== GITHUB ACTIONS ====================

  const githubActionNewIssue = await prisma.action.findFirst({
    where: { serviceId: githubService.id, name: 'new_issue' }
  }) || await prisma.action.create({
    data: {
      name: 'new_issue',
      description: 'Triggers when a new issue is opened in a repository',
      serviceId: githubService.id,
      params: [
        {
          name: 'owner',
          description: 'Repository owner (username or organization)',
          type: 'string',
          required: true
        },
        {
          name: 'repo',
          description: 'Repository name',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const githubActionNewPullRequest = await prisma.action.findFirst({
    where: { serviceId: githubService.id, name: 'new_pull_request' }
  }) || await prisma.action.create({
    data: {
      name: 'new_pull_request',
      description: 'Triggers when a new pull request is opened',
      serviceId: githubService.id,
      params: [
        {
          name: 'owner',
          description: 'Repository owner',
          type: 'string',
          required: true
        },
        {
          name: 'repo',
          description: 'Repository name',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const githubActionPullRequestMerged = await prisma.action.findFirst({
    where: { serviceId: githubService.id, name: 'pull_request_merged' }
  }) || await prisma.action.create({
    data: {
      name: 'pull_request_merged',
      description: 'Triggers when a pull request is merged',
      serviceId: githubService.id,
      params: [
        {
          name: 'owner',
          description: 'Repository owner',
          type: 'string',
          required: true
        },
        {
          name: 'repo',
          description: 'Repository name',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const githubActionNewStar = await prisma.action.findFirst({
    where: { serviceId: githubService.id, name: 'new_star' }
  }) || await prisma.action.create({
    data: {
      name: 'new_star',
      description: 'Triggers when repository receives a new star',
      serviceId: githubService.id,
      params: [
        {
          name: 'owner',
          description: 'Repository owner',
          type: 'string',
          required: true
        },
        {
          name: 'repo',
          description: 'Repository name',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const githubActionNewCommit = await prisma.action.findFirst({
    where: { serviceId: githubService.id, name: 'new_commit' }
  }) || await prisma.action.create({
    data: {
      name: 'new_commit',
      description: 'Triggers when a new commit is pushed to a branch',
      serviceId: githubService.id,
      params: [
        {
          name: 'owner',
          description: 'Repository owner',
          type: 'string',
          required: true
        },
        {
          name: 'repo',
          description: 'Repository name',
          type: 'string',
          required: true
        },
        {
          name: 'branch',
          description: 'Branch name (default: main)',
          type: 'string',
          required: false
        }
      ]
    }
  });

  const githubActionNewRelease = await prisma.action.findFirst({
    where: { serviceId: githubService.id, name: 'new_release' }
  }) || await prisma.action.create({
    data: {
      name: 'new_release',
      description: 'Triggers when a new release is published',
      serviceId: githubService.id,
      params: [
        {
          name: 'owner',
          description: 'Repository owner',
          type: 'string',
          required: true
        },
        {
          name: 'repo',
          description: 'Repository name',
          type: 'string',
          required: true
        }
      ]
    }
  });

  // ==================== GITHUB REACTIONS ====================

  const githubReactionCreateIssue = await prisma.reaction.findFirst({
    where: { serviceId: githubService.id, name: 'create_issue' }
  }) || await prisma.reaction.create({
    data: {
      name: 'create_issue',
      description: 'Create a new issue in a repository',
      serviceId: githubService.id,
      params: [
        {
          name: 'owner',
          description: 'Repository owner',
          type: 'string',
          required: true
        },
        {
          name: 'repo',
          description: 'Repository name',
          type: 'string',
          required: true
        },
        {
          name: 'title',
          description: 'Issue title',
          type: 'string',
          required: true
        },
        {
          name: 'body',
          description: 'Issue description',
          type: 'string',
          required: false
        },
        {
          name: 'labels',
          description: 'Comma-separated labels (e.g., bug,enhancement)',
          type: 'string',
          required: false
        }
      ]
    }
  });

  const githubReactionCreateComment = await prisma.reaction.findFirst({
    where: { serviceId: githubService.id, name: 'create_comment' }
  }) || await prisma.reaction.create({
    data: {
      name: 'create_comment',
      description: 'Add a comment to an issue or pull request',
      serviceId: githubService.id,
      params: [
        {
          name: 'owner',
          description: 'Repository owner',
          type: 'string',
          required: true
        },
        {
          name: 'repo',
          description: 'Repository name',
          type: 'string',
          required: true
        },
        {
          name: 'issueNumber',
          description: 'Issue or PR number',
          type: 'number',
          required: true
        },
        {
          name: 'body',
          description: 'Comment text',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const githubReactionStarRepository = await prisma.reaction.findFirst({
    where: { serviceId: githubService.id, name: 'star_repository' }
  }) || await prisma.reaction.create({
    data: {
      name: 'star_repository',
      description: 'Star a repository',
      serviceId: githubService.id,
      params: [
        {
          name: 'owner',
          description: 'Repository owner',
          type: 'string',
          required: true
        },
        {
          name: 'repo',
          description: 'Repository name',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const githubReactionCreateBranch = await prisma.reaction.findFirst({
    where: { serviceId: githubService.id, name: 'create_branch' }
  }) || await prisma.reaction.create({
    data: {
      name: 'create_branch',
      description: 'Create a new branch in a repository',
      serviceId: githubService.id,
      params: [
        {
          name: 'owner',
          description: 'Repository owner',
          type: 'string',
          required: true
        },
        {
          name: 'repo',
          description: 'Repository name',
          type: 'string',
          required: true
        },
        {
          name: 'branchName',
          description: 'Name for the new branch',
          type: 'string',
          required: true
        },
        {
          name: 'fromBranch',
          description: 'Source branch (default: main)',
          type: 'string',
          required: false
        }
      ]
    }
  });

  const githubReactionCloseIssue = await prisma.reaction.findFirst({
    where: { serviceId: githubService.id, name: 'close_issue' }
  }) || await prisma.reaction.create({
    data: {
      name: 'close_issue',
      description: 'Close an issue',
      serviceId: githubService.id,
      params: [
        {
          name: 'owner',
          description: 'Repository owner',
          type: 'string',
          required: true
        },
        {
          name: 'repo',
          description: 'Repository name',
          type: 'string',
          required: true
        },
        {
          name: 'issueNumber',
          description: 'Issue number to close',
          type: 'number',
          required: true
        }
      ]
    }
  });

  const githubReactionAddLabel = await prisma.reaction.findFirst({
    where: { serviceId: githubService.id, name: 'add_label' }
  }) || await prisma.reaction.create({
    data: {
      name: 'add_label',
      description: 'Add labels to an issue or pull request',
      serviceId: githubService.id,
      params: [
        {
          name: 'owner',
          description: 'Repository owner',
          type: 'string',
          required: true
        },
        {
          name: 'repo',
          description: 'Repository name',
          type: 'string',
          required: true
        },
        {
          name: 'issueNumber',
          description: 'Issue or PR number',
          type: 'number',
          required: true
        },
        {
          name: 'labels',
          description: 'Comma-separated labels',
          type: 'string',
          required: true
        }
      ]
    }
  });

  // ==================== GITLAB ACTIONS ====================

  const gitlabActionNewIssue = await prisma.action.findFirst({
    where: { serviceId: gitlabService.id, name: 'new_issue' }
  }) || await prisma.action.create({
    data: {
      name: 'new_issue',
      description: 'Triggers when a new issue is created in a project',
      serviceId: gitlabService.id,
      params: [
        {
          name: 'projectId',
          description: 'GitLab project ID or URL-encoded path',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const gitlabActionMergeRequestMerged = await prisma.action.findFirst({
    where: { serviceId: gitlabService.id, name: 'merge_request_merged' }
  }) || await prisma.action.create({
    data: {
      name: 'merge_request_merged',
      description: 'Triggers when a merge request is merged',
      serviceId: gitlabService.id,
      params: [
        {
          name: 'projectId',
          description: 'GitLab project ID or URL-encoded path',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const gitlabActionPipelineCompleted = await prisma.action.findFirst({
    where: { serviceId: gitlabService.id, name: 'pipeline_completed' }
  }) || await prisma.action.create({
    data: {
      name: 'pipeline_completed',
      description: 'Triggers when a CI/CD pipeline completes (success or failure)',
      serviceId: gitlabService.id,
      params: [
        {
          name: 'projectId',
          description: 'GitLab project ID or URL-encoded path',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const gitlabActionNewMergeRequest = await prisma.action.findFirst({
    where: { serviceId: gitlabService.id, name: 'new_merge_request' }
  }) || await prisma.action.create({
    data: {
      name: 'new_merge_request',
      description: 'Triggers when a new merge request is opened',
      serviceId: gitlabService.id,
      params: [
        {
          name: 'projectId',
          description: 'GitLab project ID or URL-encoded path',
          type: 'string',
          required: true
        }
      ]
    }
  });

  // ==================== GITLAB REACTIONS ====================

  const gitlabReactionCreateIssue = await prisma.reaction.findFirst({
    where: { serviceId: gitlabService.id, name: 'create_issue' }
  }) || await prisma.reaction.create({
    data: {
      name: 'create_issue',
      description: 'Create a new issue in a project',
      serviceId: gitlabService.id,
      params: [
        {
          name: 'projectId',
          description: 'GitLab project ID or URL-encoded path',
          type: 'string',
          required: true
        },
        {
          name: 'title',
          description: 'Issue title',
          type: 'string',
          required: true
        },
        {
          name: 'description',
          description: 'Issue description',
          type: 'string',
          required: false
        },
        {
          name: 'labels',
          description: 'Comma-separated labels',
          type: 'string',
          required: false
        },
        {
          name: 'assigneeIds',
          description: 'Comma-separated assignee user IDs',
          type: 'string',
          required: false
        }
      ]
    }
  });

  const gitlabReactionCommentMergeRequest = await prisma.reaction.findFirst({
    where: { serviceId: gitlabService.id, name: 'comment_merge_request' }
  }) || await prisma.reaction.create({
    data: {
      name: 'comment_merge_request',
      description: 'Add a comment to a merge request',
      serviceId: gitlabService.id,
      params: [
        {
          name: 'projectId',
          description: 'GitLab project ID or URL-encoded path',
          type: 'string',
          required: true
        },
        {
          name: 'mergeRequestIid',
          description: 'Merge request IID (internal ID)',
          type: 'number',
          required: true
        },
        {
          name: 'body',
          description: 'Comment text',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const gitlabReactionAddLabel = await prisma.reaction.findFirst({
    where: { serviceId: gitlabService.id, name: 'add_label' }
  }) || await prisma.reaction.create({
    data: {
      name: 'add_label',
      description: 'Add labels to an issue',
      serviceId: gitlabService.id,
      params: [
        {
          name: 'projectId',
          description: 'GitLab project ID or URL-encoded path',
          type: 'string',
          required: true
        },
        {
          name: 'issueIid',
          description: 'Issue IID (internal ID)',
          type: 'number',
          required: true
        },
        {
          name: 'labels',
          description: 'Comma-separated labels',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const gitlabReactionCloseIssue = await prisma.reaction.findFirst({
    where: { serviceId: gitlabService.id, name: 'close_issue' }
  }) || await prisma.reaction.create({
    data: {
      name: 'close_issue',
      description: 'Close an issue',
      serviceId: gitlabService.id,
      params: [
        {
          name: 'projectId',
          description: 'GitLab project ID or URL-encoded path',
          type: 'string',
          required: true
        },
        {
          name: 'issueIid',
          description: 'Issue IID (internal ID)',
          type: 'number',
          required: true
        }
      ]
    }
  });

  const gitlabReactionCreateMergeRequest = await prisma.reaction.findFirst({
    where: { serviceId: gitlabService.id, name: 'create_merge_request' }
  }) || await prisma.reaction.create({
    data: {
      name: 'create_merge_request',
      description: 'Create a new merge request',
      serviceId: gitlabService.id,
      params: [
        {
          name: 'projectId',
          description: 'GitLab project ID or URL-encoded path',
          type: 'string',
          required: true
        },
        {
          name: 'sourceBranch',
          description: 'Source branch name',
          type: 'string',
          required: true
        },
        {
          name: 'targetBranch',
          description: 'Target branch name',
          type: 'string',
          required: true
        },
        {
          name: 'title',
          description: 'Merge request title',
          type: 'string',
          required: true
        },
        {
          name: 'description',
          description: 'Merge request description',
          type: 'string',
          required: false
        }
      ]
    }
  });

  const gitlabReactionTriggerPipeline = await prisma.reaction.findFirst({
    where: { serviceId: gitlabService.id, name: 'trigger_pipeline' }
  }) || await prisma.reaction.create({
    data: {
      name: 'trigger_pipeline',
      description: 'Trigger a CI/CD pipeline for a branch',
      serviceId: gitlabService.id,
      params: [
        {
          name: 'projectId',
          description: 'GitLab project ID or URL-encoded path',
          type: 'string',
          required: true
        },
        {
          name: 'ref',
          description: 'Branch or tag name',
          type: 'string',
          required: true
        }
      ]
    }
  });

  // ==================== DISCORD REACTIONS ====================

  const discordReactionSendMessage = await prisma.reaction.findFirst({
    where: { serviceId: discordService.id, name: 'send_message' }
  }) || await prisma.reaction.create({
    data: {
      name: 'send_message',
      description: 'Send a text message to a Discord channel',
      serviceId: discordService.id,
      params: [
        {
          name: 'channelId',
          description: 'Discord channel ID',
          type: 'string',
          required: true
        },
        {
          name: 'messageContent',
          description: 'Message content to send',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const discordReactionSendEmbed = await prisma.reaction.findFirst({
    where: { serviceId: discordService.id, name: 'send_embed' }
  }) || await prisma.reaction.create({
    data: {
      name: 'send_embed',
      description: 'Send a rich embed message to a Discord channel',
      serviceId: discordService.id,
      params: [
        {
          name: 'channelId',
          description: 'Discord channel ID',
          type: 'string',
          required: true
        },
        {
          name: 'embedTitle',
          description: 'Embed title',
          type: 'string',
          required: true
        },
        {
          name: 'embedDescription',
          description: 'Embed description',
          type: 'string',
          required: false
        },
        {
          name: 'embedColor',
          description: 'Embed color (decimal, e.g., 3447003 for blue)',
          type: 'number',
          required: false
        }
      ]
    }
  });

  const discordReactionSendDM = await prisma.reaction.findFirst({
    where: { serviceId: discordService.id, name: 'send_dm' }
  }) || await prisma.reaction.create({
    data: {
      name: 'send_dm',
      description: 'Send a direct message to a Discord user',
      serviceId: discordService.id,
      params: [
        {
          name: 'targetUserId',
          description: 'Discord user ID to send DM to',
          type: 'string',
          required: true
        },
        {
          name: 'messageContent',
          description: 'Message content to send',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const discordReactionAddReaction = await prisma.reaction.findFirst({
    where: { serviceId: discordService.id, name: 'add_reaction' }
  }) || await prisma.reaction.create({
    data: {
      name: 'add_reaction',
      description: 'Add an emoji reaction to a message',
      serviceId: discordService.id,
      params: [
        {
          name: 'channelId',
          description: 'Discord channel ID',
          type: 'string',
          required: true
        },
        {
          name: 'messageId',
          description: 'Message ID to react to',
          type: 'string',
          required: true
        },
        {
          name: 'emoji',
          description: 'Emoji to add (e.g., 👍, ❤️, 🎉)',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const discordReactionDeleteMessage = await prisma.reaction.findFirst({
    where: { serviceId: discordService.id, name: 'delete_message' }
  }) || await prisma.reaction.create({
    data: {
      name: 'delete_message',
      description: 'Delete a message from a channel',
      serviceId: discordService.id,
      params: [
        {
          name: 'channelId',
          description: 'Discord channel ID',
          type: 'string',
          required: true
        },
        {
          name: 'messageId',
          description: 'Message ID to delete',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const discordReactionPinMessage = await prisma.reaction.findFirst({
    where: { serviceId: discordService.id, name: 'pin_message' }
  }) || await prisma.reaction.create({
    data: {
      name: 'pin_message',
      description: 'Pin a message in a channel',
      serviceId: discordService.id,
      params: [
        {
          name: 'channelId',
          description: 'Discord channel ID',
          type: 'string',
          required: true
        },
        {
          name: 'messageId',
          description: 'Message ID to pin',
          type: 'string',
          required: true
        }
      ]
    }
  });

  // ==================== TELEGRAM ACTIONS ====================

  const telegramActionNewMessage = await prisma.action.findFirst({
    where: { serviceId: telegramService.id, name: 'new_message' }
  }) || await prisma.action.create({
    data: {
      name: 'new_message',
      description: 'Triggers when a new message is received in a specific chat',
      serviceId: telegramService.id,
      params: [
        {
          name: 'chat_id',
          description: 'Telegram chat ID to monitor',
          type: 'string',
          required: true
        },
        {
          name: 'only_text',
          description: 'Trigger only for text messages (true/false)',
          type: 'boolean',
          required: false
        }
      ]
    }
  });

  const telegramActionNewMember = await prisma.action.findFirst({
    where: { serviceId: telegramService.id, name: 'new_member' }
  }) || await prisma.action.create({
    data: {
      name: 'new_member',
      description: 'Triggers when a new member joins a group chat',
      serviceId: telegramService.id,
      params: [
        {
          name: 'chat_id',
          description: 'Group chat ID to monitor',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const telegramActionBotCommand = await prisma.action.findFirst({
    where: { serviceId: telegramService.id, name: 'bot_command' }
  }) || await prisma.action.create({
    data: {
      name: 'bot_command',
      description: 'Triggers when the bot receives a specific command',
      serviceId: telegramService.id,
      params: [
        {
          name: 'command',
          description: 'Command to listen for (without leading /)',
          type: 'string',
          required: false
        },
        {
          name: 'chat_id',
          description: 'Limit detection to a specific chat (optional)',
          type: 'string',
          required: false
        }
      ]
    }
  });

  const telegramActionChannelPost = await prisma.action.findFirst({
    where: { serviceId: telegramService.id, name: 'channel_post' }
  }) || await prisma.action.create({
    data: {
      name: 'channel_post',
      description: 'Triggers when a new post is published in a channel',
      serviceId: telegramService.id,
      params: [
        {
          name: 'channel_id',
          description: 'Channel ID to monitor',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const telegramActionPollCreated = await prisma.action.findFirst({
    where: { serviceId: telegramService.id, name: 'poll_created' }
  }) || await prisma.action.create({
    data: {
      name: 'poll_created',
      description: 'Triggers when a poll is created in a monitored chat',
      serviceId: telegramService.id,
      params: [
        {
          name: 'chat_id',
          description: 'Chat ID to monitor for polls (optional)',
          type: 'string',
          required: false
        }
      ]
    }
  });

  // ==================== TELEGRAM REACTIONS ====================

  const telegramReactionSendMessage = await prisma.reaction.findFirst({
    where: { serviceId: telegramService.id, name: 'send_message' }
  }) || await prisma.reaction.create({
    data: {
      name: 'send_message',
      description: 'Send a text message to a chat',
      serviceId: telegramService.id,
      params: [
        {
          name: 'chat_id',
          description: 'Destination chat ID',
          type: 'string',
          required: true
        },
        {
          name: 'message',
          description: 'Message content (supports template variables)',
          type: 'string',
          required: true
        },
        {
          name: 'parse_mode',
          description: 'Telegram parse mode (MarkdownV2, HTML)',
          type: 'string',
          required: false
        }
      ]
    }
  });

  const telegramReactionSendPhoto = await prisma.reaction.findFirst({
    where: { serviceId: telegramService.id, name: 'send_photo' }
  }) || await prisma.reaction.create({
    data: {
      name: 'send_photo',
      description: 'Send a photo to a chat with optional caption',
      serviceId: telegramService.id,
      params: [
        {
          name: 'chat_id',
          description: 'Destination chat ID',
          type: 'string',
          required: true
        },
        {
          name: 'photo_url',
          description: 'URL or file ID of the photo',
          type: 'string',
          required: true
        },
        {
          name: 'caption',
          description: 'Caption for the photo',
          type: 'string',
          required: false
        }
      ]
    }
  });

  const telegramReactionSendDocument = await prisma.reaction.findFirst({
    where: { serviceId: telegramService.id, name: 'send_document' }
  }) || await prisma.reaction.create({
    data: {
      name: 'send_document',
      description: 'Send a document or file to a chat',
      serviceId: telegramService.id,
      params: [
        {
          name: 'chat_id',
          description: 'Destination chat ID',
          type: 'string',
          required: true
        },
        {
          name: 'document_url',
          description: 'URL or file ID of the document',
          type: 'string',
          required: true
        },
        {
          name: 'caption',
          description: 'Caption for the document (optional)',
          type: 'string',
          required: false
        }
      ]
    }
  });

  const telegramReactionCreatePoll = await prisma.reaction.findFirst({
    where: { serviceId: telegramService.id, name: 'create_poll' }
  }) || await prisma.reaction.create({
    data: {
      name: 'create_poll',
      description: 'Create a poll in a chat',
      serviceId: telegramService.id,
      params: [
        {
          name: 'chat_id',
          description: 'Destination chat ID',
          type: 'string',
          required: true
        },
        {
          name: 'question',
          description: 'Poll question',
          type: 'string',
          required: true
        },
        {
          name: 'options',
          description: 'Comma-separated list of poll options',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const telegramReactionPinMessage = await prisma.reaction.findFirst({
    where: { serviceId: telegramService.id, name: 'pin_message' }
  }) || await prisma.reaction.create({
    data: {
      name: 'pin_message',
      description: 'Pin a message in a chat',
      serviceId: telegramService.id,
      params: [
        {
          name: 'chat_id',
          description: 'Chat ID containing the message to pin',
          type: 'string',
          required: true
        },
        {
          name: 'message_id',
          description: 'Identifier of the message to pin',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const telegramReactionKickUser = await prisma.reaction.findFirst({
    where: { serviceId: telegramService.id, name: 'kick_user' }
  }) || await prisma.reaction.create({
    data: {
      name: 'kick_user',
      description: 'Remove a user from a group chat',
      serviceId: telegramService.id,
      params: [
        {
          name: 'chat_id',
          description: 'Group chat ID',
          type: 'string',
          required: true
        },
        {
          name: 'user_id',
          description: 'User ID to remove',
          type: 'string',
          required: true
        },
        {
          name: 'until_date',
          description: 'Ban until this Unix timestamp (optional)',
          type: 'number',
          required: false
        }
      ]
    }
  });

  // ==================== ONEDRIVE ACTIONS ====================

  const onedriveActionNewFileInFolder = await prisma.action.findFirst({
    where: { serviceId: onedriveService.id, name: 'new_file_in_folder' }
  }) || await prisma.action.create({
    data: {
      name: 'new_file_in_folder',
      description: 'Triggers every time a new file is created in the folder you specify',
      serviceId: onedriveService.id,
      params: [
        {
          name: 'folder_path',
          description: 'Path to the folder to monitor (e.g., /Documents)',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const onedriveActionNewPhotoInFolder = await prisma.action.findFirst({
    where: { serviceId: onedriveService.id, name: 'new_photo_in_folder' }
  }) || await prisma.action.create({
    data: {
      name: 'new_photo_in_folder',
      description: 'Triggers every time a new photo is created in the folder you specify',
      serviceId: onedriveService.id,
      params: [
        {
          name: 'folder_path',
          description: 'Path to the folder to monitor (e.g., /Pictures)',
          type: 'string',
          required: true
        }
      ]
    }
  });

  // ==================== ONEDRIVE REACTIONS ====================

  const onedriveReactionCreateTextFile = await prisma.reaction.findFirst({
    where: { serviceId: onedriveService.id, name: 'create_text_file' }
  }) || await prisma.reaction.create({
    data: {
      name: 'create_text_file',
      description: 'Create a new text file at the path you specify',
      serviceId: onedriveService.id,
      params: [
        {
          name: 'file_path',
          description: 'Path where to create the file (e.g., /Documents/notes.txt)',
          type: 'string',
          required: true
        },
        {
          name: 'content',
          description: 'Content to write in the file',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const onedriveReactionAppendToTextFile = await prisma.reaction.findFirst({
    where: { serviceId: onedriveService.id, name: 'append_to_text_file' }
  }) || await prisma.reaction.create({
    data: {
      name: 'append_to_text_file',
      description: 'Append to a text file as defined by the file name and folder path you specify',
      serviceId: onedriveService.id,
      params: [
        {
          name: 'file_path',
          description: 'Path to the file to append to (e.g., /Documents/log.txt)',
          type: 'string',
          required: true
        },
        {
          name: 'content',
          description: 'Content to append to the file',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const onedriveReactionAddFileFromUrl = await prisma.reaction.findFirst({
    where: { serviceId: onedriveService.id, name: 'add_file_from_url' }
  }) || await prisma.reaction.create({
    data: {
      name: 'add_file_from_url',
      description: 'Download a file at a given URL and add it to OneDrive at the path you specify (30 MB limit)',
      serviceId: onedriveService.id,
      params: [
        {
          name: 'url',
          description: 'URL of the file to download',
          type: 'string',
          required: true
        },
        {
          name: 'file_path',
          description: 'Destination path in OneDrive (e.g., /Documents/downloaded.pdf)',
          type: 'string',
          required: true
        }
      ]
    }
  });

  // ==================== NOTION ACTIONS ====================

  const notionActionNewPageCreated = await prisma.action.findFirst({
    where: { serviceId: notionService.id, name: 'notion_new_page_created' }
  }) || await prisma.action.create({
    data: {
      name: 'notion_new_page_created',
      description: 'Triggers when a new page is created in the connected workspace (optional search filter)',
      serviceId: notionService.id,
      params: [
        {
          name: 'search_query',
          description: 'Optional query string to filter page titles (case insensitive)',
          type: 'string',
          required: false
        },
        {
          name: 'checkInterval',
          description: 'Polling interval in seconds (default 60)',
          type: 'number',
          required: false
        }
      ]
    }
  });

  const notionActionDatabaseEntryAdded = await prisma.action.findFirst({
    where: { serviceId: notionService.id, name: 'notion_database_entry_added' }
  }) || await prisma.action.create({
    data: {
      name: 'notion_database_entry_added',
      description: 'Triggers when a new entry is added to the specified database',
      serviceId: notionService.id,
      params: [
        {
          name: 'database_id',
          description: 'Notion database identifier (32 character ID or UUID)',
          type: 'string',
          required: true
        },
        {
          name: 'checkInterval',
          description: 'Polling interval in seconds (default 60)',
          type: 'number',
          required: false
        }
      ]
    }
  });

  const notionActionPageUpdated = await prisma.action.findFirst({
    where: { serviceId: notionService.id, name: 'notion_page_updated' }
  }) || await prisma.action.create({
    data: {
      name: 'notion_page_updated',
      description: 'Triggers when the specified page is updated (monitors last edited time)',
      serviceId: notionService.id,
      params: [
        {
          name: 'page_id',
          description: 'Notion page identifier to monitor (32 character ID or UUID)',
          type: 'string',
          required: true
        },
        {
          name: 'checkInterval',
          description: 'Polling interval in seconds (default 60)',
          type: 'number',
          required: false
        }
      ]
    }
  });

  // ==================== NOTION REACTIONS ====================

  const notionReactionCreatePage = await prisma.reaction.findFirst({
    where: { serviceId: notionService.id, name: 'notion_create_page' }
  }) || await prisma.reaction.create({
    data: {
      name: 'notion_create_page',
      description: 'Create a new page in a workspace or database',
      serviceId: notionService.id,
      params: [
        {
          name: 'parent_id',
          description: 'Parent page or database ID where the page will be created',
          type: 'string',
          required: true
        },
        {
          name: 'parent_type',
          description: 'Parent type: database or page (default: database)',
          type: 'string',
          required: false
        },
        {
          name: 'properties',
          description: 'JSON string describing the Notion page properties payload',
          type: 'string',
          required: true
        },
        {
          name: 'children',
          description: 'Optional JSON string for block children content',
          type: 'string',
          required: false
        }
      ]
    }
  });

  const notionReactionAddDatabaseEntry = await prisma.reaction.findFirst({
    where: { serviceId: notionService.id, name: 'notion_database_add_entry' }
  }) || await prisma.reaction.create({
    data: {
      name: 'notion_database_add_entry',
      description: 'Add a new entry to a Notion database',
      serviceId: notionService.id,
      params: [
        {
          name: 'database_id',
          description: 'Notion database identifier (32 character ID or UUID)',
          type: 'string',
          required: true
        },
        {
          name: 'properties',
          description: 'JSON string describing the entry properties (must include title property)',
          type: 'string',
          required: true
        },
        {
          name: 'children',
          description: 'Optional JSON string for page content blocks',
          type: 'string',
          required: false
        }
      ]
    }
  });

  const notionReactionUpdatePage = await prisma.reaction.findFirst({
    where: { serviceId: notionService.id, name: 'notion_update_page' }
  }) || await prisma.reaction.create({
    data: {
      name: 'notion_update_page',
      description: 'Update properties of an existing Notion page',
      serviceId: notionService.id,
      params: [
        {
          name: 'page_id',
          description: 'Notion page identifier to update',
          type: 'string',
          required: true
        },
        {
          name: 'properties',
          description: 'JSON string describing the properties to update',
          type: 'string',
          required: true
        }
      ]
    }
  });

  // YouTube Actions
  const youtubeActionNewVideo = await prisma.action.findFirst({
    where: { serviceId: youtubeService.id, name: 'youtube_new_video_uploaded' }
  }) || await prisma.action.create({
    data: {
      name: 'youtube_new_video_uploaded',
      description: 'Triggers when a new video is uploaded to a YouTube channel',
      serviceId: youtubeService.id,
      params: [
        {
          name: 'channelId',
          description: 'YouTube channel ID to monitor',
          type: 'string',
          required: true
        },
        {
          name: 'checkInterval',
          description: 'Check interval in seconds (60-3600)',
          type: 'number',
          required: false
        },
        {
          name: 'includeShorts',
          description: 'Include YouTube Shorts',
          type: 'boolean',
          required: false
        }
      ]
    }
  });

  const youtubeActionNewComment = await prisma.action.findFirst({
    where: { serviceId: youtubeService.id, name: 'youtube_new_comment' }
  }) || await prisma.action.create({
    data: {
      name: 'youtube_new_comment',
      description: 'Triggers when a new comment is posted on a specific YouTube video',
      serviceId: youtubeService.id,
      params: [
        {
          name: 'videoId',
          description: 'YouTube video ID to monitor',
          type: 'string',
          required: true
        },
        {
          name: 'filterKeywords',
          description: 'Filter comments by keywords',
          type: 'array',
          required: false
        },
        {
          name: 'authorFilter',
          description: 'Filter by author name',
          type: 'string',
          required: false
        }
      ]
    }
  });

  const youtubeActionNewSubscriber = await prisma.action.findFirst({
    where: { serviceId: youtubeService.id, name: 'youtube_new_subscriber' }
  }) || await prisma.action.create({
    data: {
      name: 'youtube_new_subscriber',
      description: 'Triggers when you subscribe to a new YouTube channel',
      serviceId: youtubeService.id,
      params: [
        {
          name: 'channelFilter',
          description: 'Filter by channel name',
          type: 'string',
          required: false
        }
      ]
    }
  });

  const youtubeActionVideoLiked = await prisma.action.findFirst({
    where: { serviceId: youtubeService.id, name: 'youtube_video_liked' }
  }) || await prisma.action.create({
    data: {
      name: 'youtube_video_liked',
      description: 'Triggers when you like a YouTube video',
      serviceId: youtubeService.id,
      params: [
        {
          name: 'channelFilter',
          description: 'Filter by channel name',
          type: 'string',
          required: false
        },
        {
          name: 'categoryFilter',
          description: 'Filter by category ID',
          type: 'string',
          required: false
        }
      ]
    }
  });

  const youtubeActionLivestreamStarted = await prisma.action.findFirst({
    where: { serviceId: youtubeService.id, name: 'youtube_livestream_started' }
  }) || await prisma.action.create({
    data: {
      name: 'youtube_livestream_started',
      description: 'Triggers when a YouTube channel starts a live stream',
      serviceId: youtubeService.id,
      params: [
        {
          name: 'channelId',
          description: 'YouTube channel ID to monitor',
          type: 'string',
          required: true
        },
        {
          name: 'titleKeywords',
          description: 'Filter by stream title keywords',
          type: 'array',
          required: false
        }
      ]
    }
  });

  // YouTube Reactions
  const youtubeReactionPostComment = await prisma.reaction.findFirst({
    where: { serviceId: youtubeService.id, name: 'youtube_post_comment' }
  }) || await prisma.reaction.create({
    data: {
      name: 'youtube_post_comment',
      description: 'Posts a comment on a YouTube video',
      serviceId: youtubeService.id,
      params: [
        {
          name: 'videoId',
          description: 'YouTube video ID to comment on',
          type: 'string',
          required: true
        },
        {
          name: 'comment',
          description: 'Comment text (supports template variables)',
          type: 'string',
          required: true
        },
        {
          name: 'useTemplates',
          description: 'Enable template variable replacement',
          type: 'boolean',
          required: false
        }
      ]
    }
  });

  const youtubeReactionLikeVideo = await prisma.reaction.findFirst({
    where: { serviceId: youtubeService.id, name: 'youtube_like_video' }
  }) || await prisma.reaction.create({
    data: {
      name: 'youtube_like_video',
      description: 'Likes a YouTube video',
      serviceId: youtubeService.id,
      params: [
        {
          name: 'videoId',
          description: 'YouTube video ID to like',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const youtubeReactionAddToPlaylist = await prisma.reaction.findFirst({
    where: { serviceId: youtubeService.id, name: 'youtube_add_to_playlist' }
  }) || await prisma.reaction.create({
    data: {
      name: 'youtube_add_to_playlist',
      description: 'Adds a video to a YouTube playlist',
      serviceId: youtubeService.id,
      params: [
        {
          name: 'playlistId',
          description: 'YouTube playlist ID',
          type: 'string',
          required: true
        },
        {
          name: 'videoId',
          description: 'YouTube video ID to add',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const youtubeReactionCreatePlaylist = await prisma.reaction.findFirst({
    where: { serviceId: youtubeService.id, name: 'youtube_create_playlist' }
  }) || await prisma.reaction.create({
    data: {
      name: 'youtube_create_playlist',
      description: 'Creates a new YouTube playlist',
      serviceId: youtubeService.id,
      params: [
        {
          name: 'title',
          description: 'Playlist title',
          type: 'string',
          required: true
        },
        {
          name: 'description',
          description: 'Playlist description',
          type: 'string',
          required: false
        },
        {
          name: 'privacyStatus',
          description: 'Privacy setting (private, public, unlisted)',
          type: 'string',
          required: false
        }
      ]
    }
  });

  const youtubeReactionSubscribeChannel = await prisma.reaction.findFirst({
    where: { serviceId: youtubeService.id, name: 'youtube_subscribe_channel' }
  }) || await prisma.reaction.create({
    data: {
      name: 'youtube_subscribe_channel',
      description: 'Subscribes to a YouTube channel',
      serviceId: youtubeService.id,
      params: [
        {
          name: 'channelId',
          description: 'YouTube channel ID to subscribe to',
          type: 'string',
          required: true
        }
      ]
    }
  });

  // ==================== OPENAI REACTIONS ====================

  const openaiReactionGenerateText = await prisma.reaction.findFirst({
    where: { serviceId: openaiService.id, name: 'generate_text' }
  }) || await prisma.reaction.create({
    data: {
      name: 'generate_text',
      description: 'Generate text using GPT',
      serviceId: openaiService.id,
      params: [
        {
          name: 'prompt',
          description: 'Text prompt for GPT (can use action data variables)',
          type: 'string',
          required: true
        },
        {
          name: 'max_tokens',
          description: 'Maximum tokens to generate (default: 150)',
          type: 'number',
          required: false
        },
        {
          name: 'temperature',
          description: 'Creativity level 0-1 (default: 0.7)',
          type: 'number',
          required: false
        }
      ]
    }
  });

  const openaiReactionSummarize = await prisma.reaction.findFirst({
    where: { serviceId: openaiService.id, name: 'summarize_text' }
  }) || await prisma.reaction.create({
    data: {
      name: 'summarize_text',
      description: 'Summarize a text using GPT',
      serviceId: openaiService.id,
      params: [
        {
          name: 'text',
          description: 'Text to summarize (can use action data)',
          type: 'string',
          required: true
        },
        {
          name: 'max_length',
          description: 'Maximum summary length in words (default: 50)',
          type: 'number',
          required: false
        }
      ]
    }
  });

  const openaiReactionTranslate = await prisma.reaction.findFirst({
    where: { serviceId: openaiService.id, name: 'translate_text' }
  }) || await prisma.reaction.create({
    data: {
      name: 'translate_text',
      description: 'Translate text to another language',
      serviceId: openaiService.id,
      params: [
        {
          name: 'text',
          description: 'Text to translate',
          type: 'string',
          required: true
        },
        {
          name: 'target_language',
          description: 'Target language (e.g., French, Spanish, Japanese)',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const openaiReactionAnswerQuestion = await prisma.reaction.findFirst({
    where: { serviceId: openaiService.id, name: 'answer_question' }
  }) || await prisma.reaction.create({
    data: {
      name: 'answer_question',
      description: 'Answer a question using GPT',
      serviceId: openaiService.id,
      params: [
        {
          name: 'question',
          description: 'Question to answer',
          type: 'string',
          required: true
        },
        {
          name: 'context',
          description: 'Additional context for the answer (optional)',
          type: 'string',
          required: false
        }
      ]
    }
  });

  const openaiReactionGenerateCode = await prisma.reaction.findFirst({
    where: { serviceId: openaiService.id, name: 'generate_code' }
  }) || await prisma.reaction.create({
    data: {
      name: 'generate_code',
      description: 'Generate code using GPT',
      serviceId: openaiService.id,
      params: [
        {
          name: 'description',
          description: 'Description of the code to generate',
          type: 'string',
          required: true
        },
        {
          name: 'language',
          description: 'Programming language (e.g., JavaScript, Python)',
          type: 'string',
          required: false
        }
      ]
    }
  });

  const openaiReactionExplainCode = await prisma.reaction.findFirst({
    where: { serviceId: openaiService.id, name: 'explain_code' }
  }) || await prisma.reaction.create({
    data: {
      name: 'explain_code',
      description: 'Explain code using GPT',
      serviceId: openaiService.id,
      params: [
        {
          name: 'code',
          description: 'Code to explain',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const openaiReactionFixGrammar = await prisma.reaction.findFirst({
    where: { serviceId: openaiService.id, name: 'fix_grammar' }
  }) || await prisma.reaction.create({
    data: {
      name: 'fix_grammar',
      description: 'Fix grammar and spelling using GPT',
      serviceId: openaiService.id,
      params: [
        {
          name: 'text',
          description: 'Text to fix',
          type: 'string',
          required: true
        }
      ]
    }
  });

  const openaiReactionSentimentAnalysis = await prisma.reaction.findFirst({
    where: { serviceId: openaiService.id, name: 'sentiment_analysis' }
  }) || await prisma.reaction.create({
    data: {
      name: 'sentiment_analysis',
      description: 'Analyze sentiment of text using GPT',
      serviceId: openaiService.id,
      params: [
        {
          name: 'text',
          description: 'Text to analyze',
          type: 'string',
          required: true
        }
      ]
    }
  });

  console.log('Seed completed!');
  console.log('Timer Service:', timerService);
  console.log('Console Service:', consoleService);
  console.log('Discord Service:', discordService);
  console.log('Telegram Service:', telegramService);
  console.log('Spotify Service:', spotifyService);
  console.log('Reddit Service:', redditService);
  console.log('GitHub Service:', githubService);
  console.log('GitLab Service:', gitlabService);
  console.log('OneDrive Service:', onedriveService);
  console.log('YouTube Service:', youtubeService);
  console.log('Notion Service:', notionService);
  console.log('OpenAI Service:', openaiService);
  console.log('Actions:', { timerActionTime, timerActionDate });
  console.log('Reactions:', { consoleReactionLog, discordReactionWebhook });
  console.log('Spotify Actions:', {
    spotifyActionNewTrackInPlaylist,
    spotifyActionNewSavedTrack,
    spotifyActionSongPlaying,
    spotifyActionPlaylistUpdated
  });
  console.log('Spotify Reactions:', {
    spotifyReactionPlayTrack,
    spotifyReactionAddToPlaylist,
    spotifyReactionCreatePlaylist,
    spotifyReactionSaveTrack,
    spotifyReactionPausePlayback,
    spotifyReactionResumePlayback,
    spotifyReactionNextTrack,
    spotifyReactionPreviousTrack,
    spotifyReactionSetVolume,
    spotifyReactionShuffleToggle
  });
  console.log('Reddit Actions:', {
    redditActionNewPostInSubreddit,
    redditActionNewCommentOnPost,
    redditActionNewMessage,
    redditActionPostScoreThreshold,
    redditActionNewSubscriberMilestone
  });
  console.log('Reddit Reactions:', {
    redditReactionSubmitPost,
    redditReactionSubmitComment,
    redditReactionUpvote,
    redditReactionSavePost,
    redditReactionSubscribeSubreddit,
    redditReactionUnsubscribeSubreddit,
    redditReactionSendMessage
  });
  console.log('Discord Actions:', {
    discordActionNewMessageInChannel,
    discordActionNewMemberJoined,
    discordActionMessageReactionAdded
  });
  console.log('Telegram Actions:', {
    telegramActionNewMessage,
    telegramActionNewMember,
    telegramActionBotCommand,
    telegramActionChannelPost,
    telegramActionPollCreated
  });
  console.log('Discord Reactions:', {
    discordReactionSendMessage,
    discordReactionSendEmbed,
    discordReactionSendDM,
    discordReactionAddReaction,
    discordReactionDeleteMessage,
    discordReactionPinMessage
  });
  console.log('Telegram Reactions:', {
    telegramReactionSendMessage,
    telegramReactionSendPhoto,
    telegramReactionSendDocument,
    telegramReactionCreatePoll,
    telegramReactionPinMessage,
    telegramReactionKickUser
  });
  console.log('GitHub Actions:', {
    githubActionNewIssue,
    githubActionNewPullRequest,
    githubActionPullRequestMerged,
    githubActionNewStar,
    githubActionNewCommit,
    githubActionNewRelease
  });
  console.log('GitHub Reactions:', {
    githubReactionCreateIssue,
    githubReactionCreateComment,
    githubReactionStarRepository,
    githubReactionCreateBranch,
    githubReactionCloseIssue,
    githubReactionAddLabel
  });
  console.log('OneDrive Actions:', {
    onedriveActionNewFileInFolder,
    onedriveActionNewPhotoInFolder
  });
  console.log('OneDrive Reactions:', {
    onedriveReactionCreateTextFile,
    onedriveReactionAppendToTextFile,
    onedriveReactionAddFileFromUrl
  });
  console.log('Notion Actions:', {
    notionActionNewPageCreated,
    notionActionDatabaseEntryAdded,
    notionActionPageUpdated
  });
  console.log('Notion Reactions:', {
    notionReactionCreatePage,
    notionReactionAddDatabaseEntry,
    notionReactionUpdatePage
  });
  console.log('YouTube Actions:', {
    youtubeActionNewVideo,
    youtubeActionNewComment,
    youtubeActionNewSubscriber,
    youtubeActionVideoLiked,
    youtubeActionLivestreamStarted
  });
  console.log('YouTube Reactions:', {
    youtubeReactionPostComment,
    youtubeReactionLikeVideo,
    youtubeReactionAddToPlaylist,
    youtubeReactionCreatePlaylist,
    youtubeReactionSubscribeChannel
  });
  console.log('OpenAI Reactions:', {
    openaiReactionGenerateText,
    openaiReactionSummarize,
    openaiReactionTranslate,
    openaiReactionAnswerQuestion,
    openaiReactionGenerateCode,
    openaiReactionExplainCode,
    openaiReactionFixGrammar,
    openaiReactionSentimentAnalysis
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
