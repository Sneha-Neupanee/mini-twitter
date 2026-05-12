package com.minitwitter.messaging.controller;

import com.minitwitter.messaging.dto.ConversationDTO;
import com.minitwitter.messaging.dto.MessageDTO;
import com.minitwitter.messaging.dto.SendMessageRequest;
import com.minitwitter.messaging.service.MessagingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessagingController {

    private final MessagingService messagingService;

    @PostMapping
    public ResponseEntity<MessageDTO> sendMessage(@Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(messagingService.sendMessage(request));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> getConversations() {
        return ResponseEntity.ok(messagingService.getConversations());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<MessageDTO>> getConversation(@PathVariable Long userId) {
        return ResponseEntity.ok(messagingService.getConversation(userId));
    }
}
