package com.minitwitter.engagement.controller;

import com.minitwitter.engagement.dto.CommentDTO;
import com.minitwitter.engagement.dto.CommentRequest;
import com.minitwitter.engagement.service.EngagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class EngagementController {

    private final EngagementService engagementService;

    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Boolean>> toggleLike(@PathVariable Long id) {
        boolean liked = engagementService.toggleLike(id);
        return ResponseEntity.ok(Map.of("liked", liked));
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<CommentDTO> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(engagementService.addComment(id, request));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<Page<CommentDTO>> getComments(
            @PathVariable Long id,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(engagementService.getComments(id, pageable));
    }
}
