import { YouTubeServiceAdapter } from '../youtube-adapter';
import { NewVideoUploadedAction } from './newVideoUploaded';
import { NewCommentAction } from './newComment';
import { NewSubscriberAction } from './newSubscriber';
import { VideoLikedAction } from './videoLiked';
import { LivestreamStartedAction } from './livestreamStarted';

export function getActions(adapter: YouTubeServiceAdapter) {
  return {
    youtube_new_video_uploaded: new NewVideoUploadedAction(adapter),
    youtube_new_comment: new NewCommentAction(adapter),
    youtube_new_subscriber: new NewSubscriberAction(adapter),
    youtube_video_liked: new VideoLikedAction(adapter),
    youtube_livestream_started: new LivestreamStartedAction(adapter),
  };
}

export function getActionsMetadata() {
  return [
    NewVideoUploadedAction.getMetadata(),
    NewCommentAction.getMetadata(),
    NewSubscriberAction.getMetadata(),
    VideoLikedAction.getMetadata(),
    LivestreamStartedAction.getMetadata(),
  ];
}
