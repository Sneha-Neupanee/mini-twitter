package com.minitwitter.engagement.service;

import com.minitwitter.common.AuthUtils;
import com.minitwitter.engagement.dto.CommentDTO;
import com.minitwitter.engagement.dto.CommentRequest;
import com.minitwitter.engagement.entity.Comment;
import com.minitwitter.engagement.entity.Like;
import com.minitwitter.engagement.repository.CommentRepository;
import com.minitwitter.engagement.repository.LikeRepository;
import com.minitwitter.events.model.CommentAddedEvent;
import com.minitwitter.events.model.PostLikedEvent;
import com.minitwitter.events.publisher.EventPublisher;
import com.minitwitter.exception.ResourceNotFoundException;
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
public class EngagementService {

    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final AuthUtils authUtils;
    private final EventPublisher eventPublisher;

    @Transactional
    public boolean toggleLike(Long postId) {
        User user = authUtils.getCurrentUser();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        boolean liked;
        if (likeRepository.existsByUserIdAndPostId(user.getId(), postId)) {
            likeRepository.deleteByUserIdAndPostId(user.getId(), postId);
            liked = false;
        } else {
            Like like = Like.builder().user(user).post(post).build();
            likeRepository.save(like);
            liked = true;
        }

        eventPublisher.publishPostLiked(PostLikedEvent.builder()
                .postId(postId)
                .userId(user.getId())
                .liked(liked)
                .build());

        return liked;
    }

    @Transactional
    public CommentDTO addComment(Long postId, CommentRequest request) {
        User user = authUtils.getCurrentUser();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        Comment comment = Comment.builder()
                .user(user)
                .post(post)
                .text(request.getText())
                .build();

        comment = commentRepository.save(comment);

        eventPublisher.publishCommentAdded(CommentAddedEvent.builder()
                .postId(postId)
                .commentId(comment.getId())
                .userId(user.getId())
                .text(request.getText())
                .build());

        return mapCommentToDTO(comment);
    }

    @Transactional(readOnly = true)
    public Page<CommentDTO> getComments(Long postId, Pageable pageable) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post not found: " + postId);
        }
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId, pageable)
                .map(this::mapCommentToDTO);
    }

    private CommentDTO mapCommentToDTO(Comment comment) {
        return CommentDTO.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .authorId(comment.getUser().getId())
                .authorUsername(comment.getUser().getUsername())
                .authorAvatarUrl(comment.getUser().getAvatarUrl())
                .text(comment.getText())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
