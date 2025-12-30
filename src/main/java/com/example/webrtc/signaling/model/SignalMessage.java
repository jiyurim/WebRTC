package com.example.webrtc.signaling.model;

import lombok.Data;

@Data
public class SignalMessage {
    private String type;
    private String roomId;
    private Object offer;
    private Object answer;
    private Object candidate;

    private String senderSessionId;
}
