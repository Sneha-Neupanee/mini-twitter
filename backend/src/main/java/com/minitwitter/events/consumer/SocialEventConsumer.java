package com.minitwitter.events.consumer;

import com.minitwitter.events.model.*;
import com.minitwitter.feed.service.FeedService;
import com.minitwitter.social.repository.FollowRepository;
import com.minitwitter.trending.service.TrendingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SocialEventConsumer {

    private final FeedService feedService;
    private final TrendingService trendingService;
    private final FollowRepository followRepository;

    @RabbitListener(queues = "${rabbitmq.queues.post-created}")
    public void handlePostCreated(PostCreatedEvent event) {
        log.info("Received PostCreatedEvent for post: {}", event.getPostId());
        // Invalidate feed caches for all followers of the author
        List<Long> followerIds = followRepository.findFollowersByUserId(event.getAuthorId())
                .stream().map(u -> u.getId()).toList();
        followerIds.forEach(feedService::invalidateUserFeedCache);
        feedService.invalidateUserFeedCache(event.getAuthorId());
    }

    @RabbitListener(queues = "${rabbitmq.queues.post-liked}")
    public void handlePostLiked(PostLikedEvent event) {
        log.info("Received PostLikedEvent for post: {}", event.getPostId());
        trendingService.updateEngagementScore(event.getPostId());
        trendingService.invalidateTrendingCache();
    }

    @RabbitListener(queues = "${rabbitmq.queues.comment-added}")
    public void handleCommentAdded(CommentAddedEvent event) {
        log.info("Received CommentAddedEvent for post: {}", event.getPostId());
        trendingService.updateEngagementScore(event.getPostId());
        trendingService.invalidateTrendingCache();
    }

    @RabbitListener(queues = "${rabbitmq.queues.user-followed}")
    public void handleUserFollowed(UserFollowedEvent event) {
        log.info("Received UserFollowedEvent: follower={} -> following={}", event.getFollowerId(), event.getFollowingId());
        feedService.invalidateUserFeedCache(event.getFollowerId());
    }
}
