package com.example.webrtc.config;

import com.example.webrtc.signaling.SignalingHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Client가 subscribe 하는 경로
        registry.enableSimpleBroker("/topic");

        // Client → Server 메시지 prefix
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/signal")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}

