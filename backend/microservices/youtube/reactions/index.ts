import { YouTubeServiceAdapter } from '../youtube-adapter';
import { PostCommentReaction } from './postComment';
import { LikeVideoReaction } from './likeVideo';
import { AddToPlaylistReaction } from './addToPlaylist';
import { CreatePlaylistReaction } from './createPlaylist';
import { SubscribeChannelReaction } from './subscribeChannel';

export function getReactions(adapter: YouTubeServiceAdapter) {
  return {
    youtube_post_comment: new PostCommentReaction(adapter),
    youtube_like_video: new LikeVideoReaction(adapter),
    youtube_add_to_playlist: new AddToPlaylistReaction(adapter),
    youtube_create_playlist: new CreatePlaylistReaction(adapter),
    youtube_subscribe_channel: new SubscribeChannelReaction(adapter),
  };
}

export function getReactionsMetadata() {
  return [
    PostCommentReaction.getMetadata(),
    LikeVideoReaction.getMetadata(),
    AddToPlaylistReaction.getMetadata(),
    CreatePlaylistReaction.getMetadata(),
    SubscribeChannelReaction.getMetadata(),
  ];
}
