package com.minitwitter.post.repository;

import com.minitwitter.post.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.user.id IN :userIds AND p.repost = false ORDER BY p.createdAt DESC")
    Page<Post> findHomeFeed(@Param("userIds") List<Long> userIds, Pageable pageable);

    @Query("SELECT p FROM Post p ORDER BY p.engagementScore DESC")
    Page<Post> findTrendingPosts(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.user.id IN :userIds ORDER BY p.engagementScore DESC")
    Page<Post> findRankedFeed(@Param("userIds") List<Long> userIds, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Post p WHERE p.originalPost.id = :postId AND p.repost = true")
    long countReposts(@Param("postId") Long postId);
}
