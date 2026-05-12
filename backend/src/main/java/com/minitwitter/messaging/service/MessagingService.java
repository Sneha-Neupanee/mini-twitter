package com.minitwitter.messaging.service;

import com.minitwitter.common.AuthUtils;
import com.minitwitter.exception.ResourceNotFoundException;
import com.minitwitter.messaging.dto.ConversationDTO;
import com.minitwitter.messaging.dto.MessageDTO;
import com.minitwitter.messaging.dto.SendMessageRequest;
import com.minitwitter.messaging.entity.Message;
import com.minitwitter.messaging.repository.MessageRepository;
import com.minitwitter.user.entity.User;
import com.minitwitter.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessagingService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final AuthUtils authUtils;

    @Transactional
    public MessageDTO sendMessage(SendMessageRequest request) {
        User sender = authUtils.getCurrentUser();
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getReceiverId()));

        if (sender.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException("Cannot send message to yourself");
        }

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(request.getContent())
                .read(false)
                .build();

        message = messageRepository.save(message);
        return mapToDTO(message);
    }

    @Transactional
    public List<MessageDTO> getConversation(Long otherUserId) {
        User currentUser = authUtils.getCurrentUser();
        if (!userRepository.existsById(otherUserId)) {
            throw new ResourceNotFoundException("User not found: " + otherUserId);
        }

        List<Message> messages = messageRepository.findConversation(currentUser.getId(), otherUserId);

        // Mark unread messages as read
        messages.stream()
                .filter(m -> m.getReceiver().getId().equals(currentUser.getId()) && !m.isRead())
                .forEach(m -> {
                    m.setRead(true);
                    messageRepository.save(m);
                });

        return messages.stream().map(this::mapToDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<ConversationDTO> getConversations() {
        User currentUser = authUtils.getCurrentUser();
        List<Long> partnerIds = messageRepository.findConversationPartnerIds(currentUser.getId());

        return partnerIds.stream().map(partnerId -> {
            User partner = userRepository.findById(partnerId).orElse(null);
            if (partner == null) return null;

            List<Message> conversation = messageRepository.findConversation(currentUser.getId(), partnerId);
            MessageDTO lastMessage = conversation.isEmpty() ? null :
                    mapToDTO(conversation.get(conversation.size() - 1));

            long unreadCount = messageRepository.countBySenderIdAndReceiverIdAndReadFalse(
                    partnerId, currentUser.getId());

            return ConversationDTO.builder()
                    .userId(partner.getId())
                    .username(partner.getUsername())
                    .avatarUrl(partner.getAvatarUrl())
                    .lastMessage(lastMessage)
                    .unreadCount(unreadCount)
                    .build();
        }).filter(c -> c != null).toList();
    }

    private MessageDTO mapToDTO(Message message) {
        return MessageDTO.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderUsername(message.getSender().getUsername())
                .senderAvatarUrl(message.getSender().getAvatarUrl())
                .receiverId(message.getReceiver().getId())
                .receiverUsername(message.getReceiver().getUsername())
                .content(message.getContent())
                .read(message.isRead())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
