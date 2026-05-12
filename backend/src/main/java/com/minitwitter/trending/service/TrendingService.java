package com.minitwitter.trending.service;

import com.minitwitter.common.AuthUtils;
import com.minitwitter.post.dto.PostDTO;
import com.minitwitter.post.entity.Post;
import com.minitwitter.post.repository.PostRepository;
import com.minitwitter.post.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrendingService {

    private final PostRepository postRepository;
    private final PostService postService;
    private final AuthUtils authUtils;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String TRENDING_KEY = "trending:posts";
    private static final Duration TRENDING_TTL = Duration.ofMinutes(10);

    @Transactional(readOnly = true)
    public Page<PostDTO> getTrendingPosts(Pageable pageable) {
        Long currentUserId = authUtils.getCurrentUserId();
        return postRepository.findTrendingPosts(pageable)
                .map(p -> postService.mapToDTO(p, currentUserId));
    }

    @Transactional
    public void updateEngagementScore(Long postId) {
        postRepository.findById(postId).ifPresent(post -> {
            double score = calculateScore(post);
            post.setEngagementScore(score);
            postRepository.save(post);
            log.debug("Updated engagement score for post {}: {}", postId, score);
        });
    }

    private double calculateScore(Post post) {
        long likes = post.getLikes().size();
        long comments = post.getComments().size();
        long reposts = post.getReposts().size();

        long ageInHours = java.time.Duration.between(post.getCreatedAt(),
                java.time.LocalDateTime.now()).toHours();
        double timeDecay = ageInHours * 0.5;

        return (likes * 2.0) + (comments * 3.0) + (reposts * 4.0) - timeDecay;
    }

    public void invalidateTrendingCache() {
        redisTemplate.delete(TRENDING_KEY);
    }
}
