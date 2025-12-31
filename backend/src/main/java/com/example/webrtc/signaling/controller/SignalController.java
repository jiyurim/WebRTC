package com.example.webrtc.signaling.controller;

import com.example.webrtc.signaling.model.SignalMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
public class SignalController {

    private final SimpMessagingTemplate messagingTemplate;

    public SignalController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/signal")
    public void handleSignal(@Payload SignalMessage message, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();

        // 세션 ID 추가
        message.setSenderSessionId(sessionId);

        log.info("📩 Signal received - Type: {}, RoomId: {}, SessionId: {}",
                message.getType(), message.getRoomId(), sessionId);

        // 같은 방의 모든 사용자에게 브로드캐스트
        messagingTemplate.convertAndSend("/topic/room/" + message.getRoomId(), message);

        log.info("📤 Signal sent to room: {}", message.getRoomId());
    }
}