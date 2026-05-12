package com.minitwitter.post.service;

import com.minitwitter.common.AuthUtils;
import com.minitwitter.engagement.repository.CommentRepository;
import com.minitwitter.engagement.repository.LikeRepository;
import com.minitwitter.events.model.PostCreatedEvent;
import com.minitwitter.events.publisher.EventPublisher;
import com.minitwitter.exception.ForbiddenException;
import com.minitwitter.exception.ResourceNotFoundException;
import com.minitwitter.post.dto.CreatePostRequest;
import com.minitwitter.post.dto.PostDTO;
import com.minitwitter.post.entity.Post;
import com.minitwitter.post.repository.PostRepository;
import com.minitwitter.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final AuthUtils authUtils;
    private final EventPublisher eventPublisher;

    @Transactional
    public PostDTO createPost(CreatePostRequest request) {
        User author = authUtils.getCurrentUser();

        Post post = Post.builder()
                .user(author)
                .content(request.getContent())
                .repost(false)
                .engagementScore(0.0)
                .build();

        post = postRepository.save(post);

        eventPublisher.publishPostCreated(PostCreatedEvent.builder()
                .postId(post.getId())
                .authorId(author.getId())
                .content(post.getContent())
                .createdAt(post.getCreatedAt())
                .build());

        return mapToDTO(post, author.getId());
    }

    @Transactional
    public PostDTO repost(Long postId) {
        User currentUser = authUtils.getCurrentUser();
        Post originalPost = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        Post repost = Post.builder()
                .user(currentUser)
                .content(originalPost.getContent())
                .originalPost(originalPost)
                .repost(true)
                .engagementScore(0.0)
                .build();

        repost = postRepository.save(repost);
        return mapToDTO(repost, currentUser.getId());
    }

    @Transactional
    public void deletePost(Long postId) {
        User currentUser = authUtils.getCurrentUser();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        if (!post.getUser().getId().equals(currentUser.getId()) &&
                currentUser.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Not authorized to delete this post");
        }

        postRepository.delete(post);
    }

    @Transactional(readOnly = true)
    public PostDTO getPostById(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
        Long currentUserId = authUtils.getCurrentUserId();
        return mapToDTO(post, currentUserId);
    }

    @Transactional(readOnly = true)
    public Page<PostDTO> getUserPosts(Long userId, Pageable pageable) {
        Long currentUserId = authUtils.getCurrentUserId();
        return postRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(p -> mapToDTO(p, currentUserId));
    }

    public PostDTO mapToDTO(Post post, Long currentUserId) {
        long likesCount = likeRepository.countByPostId(post.getId());
        long commentsCount = commentRepository.countByPostId(post.getId());
        long repostsCount = postRepository.countReposts(post.getId());
        boolean liked = currentUserId != null && likeRepository.existsByUserIdAndPostId(currentUserId, post.getId());

        return PostDTO.builder()
                .id(post.getId())
                .content(post.getContent())
                .authorId(post.getUser().getId())
                .authorUsername(post.getUser().getUsername())
                .authorAvatarUrl(post.getUser().getAvatarUrl())
                .likesCount(likesCount)
                .commentsCount(commentsCount)
                .repostsCount(repostsCount)
                .likedByCurrentUser(liked)
                .repost(post.isRepost())
                .originalPostId(post.getOriginalPost() != null ? post.getOriginalPost().getId() : null)
                .engagementScore(post.getEngagementScore())
                .createdAt(post.getCreatedAt())
                .build();
    }
}
