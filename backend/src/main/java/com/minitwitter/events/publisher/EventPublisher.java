package com.minitwitter.events.publisher;

import com.minitwitter.events.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EventPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchanges.social}")
    private String socialExchange;

    @Value("${rabbitmq.routing-keys.post-created}")
    private String postCreatedKey;

    @Value("${rabbitmq.routing-keys.post-liked}")
    private String postLikedKey;

    @Value("${rabbitmq.routing-keys.comment-added}")
    private String commentAddedKey;

    @Value("${rabbitmq.routing-keys.user-followed}")
    private String userFollowedKey;

    @Async
    public void publishPostCreated(PostCreatedEvent event) {
        log.debug("Publishing PostCreatedEvent for post: {}", event.getPostId());
        rabbitTemplate.convertAndSend(socialExchange, postCreatedKey, event);
    }

    @Async
    public void publishPostLiked(PostLikedEvent event) {
        log.debug("Publishing PostLikedEvent for post: {}", event.getPostId());
        rabbitTemplate.convertAndSend(socialExchange, postLikedKey, event);
    }

    @Async
    public void publishCommentAdded(CommentAddedEvent event) {
        log.debug("Publishing CommentAddedEvent for post: {}", event.getPostId());
        rabbitTemplate.convertAndSend(socialExchange, commentAddedKey, event);
    }

    @Async
    public void publishUserFollowed(UserFollowedEvent event) {
        log.debug("Publishing UserFollowedEvent: follower={}", event.getFollowerId());
        rabbitTemplate.convertAndSend(socialExchange, userFollowedKey, event);
    }
}
