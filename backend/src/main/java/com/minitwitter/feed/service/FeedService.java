package com.minitwitter.feed.service;

import com.minitwitter.common.AuthUtils;
import com.minitwitter.post.dto.PostDTO;
import com.minitwitter.post.repository.PostRepository;
import com.minitwitter.post.service.PostService;
import com.minitwitter.social.repository.FollowRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedService {

    private final PostRepository postRepository;
    private final PostService postService;
    private final FollowRepository followRepository;
    private final AuthUtils authUtils;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String FEED_CACHE_PREFIX = "feed:home:";
    private static final Duration FEED_TTL = Duration.ofMinutes(5);

    @Transactional(readOnly = true)
    public Page<PostDTO> getHomeFeed(Pageable pageable) {
        Long currentUserId = authUtils.getCurrentUserId();

        List<Long> followingIds = followRepository.findFollowingIdsByFollowerId(currentUserId);
        followingIds.add(currentUserId);

        if (followingIds.isEmpty()) {
            return Page.empty(pageable);
        }

        return postRepository.findHomeFeed(followingIds, pageable)
                .map(p -> postService.mapToDTO(p, currentUserId));
    }

    @Transactional(readOnly = true)
    public Page<PostDTO> getRankedFeed(Pageable pageable) {
        Long currentUserId = authUtils.getCurrentUserId();

        List<Long> followingIds = followRepository.findFollowingIdsByFollowerId(currentUserId);
        followingIds.add(currentUserId);

        if (followingIds.isEmpty()) {
            return Page.empty(pageable);
        }

        return postRepository.findRankedFeed(followingIds, pageable)
                .map(p -> postService.mapToDTO(p, currentUserId));
    }

    public void invalidateUserFeedCache(Long userId) {
        String key = FEED_CACHE_PREFIX + userId;
        redisTemplate.delete(key);
        log.debug("Invalidated feed cache for user: {}", userId);
    }
}
