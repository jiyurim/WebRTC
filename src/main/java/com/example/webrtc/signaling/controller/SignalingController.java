package com.example.webrtc.signaling.controller;

import com.example.webrtc.signaling.model.SignalMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class SignalingController {
    private final SimpMessagingTemplate messagingTemplate;

    public SignalingController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/signal")
    public void handleSignal(SignalMessage message, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();

        message.setSenderSessionId(sessionId);

        messagingTemplate.convertAndSend(
                "/topic/room/" + message.getRoomId(),
                message
        );
    }

}
