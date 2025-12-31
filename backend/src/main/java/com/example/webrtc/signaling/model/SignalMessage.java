package com.example.webrtc.signaling.model;

import lombok.Data;

@Data
public class SignalMessage {
    private String type;           // "offer", "answer", "ice"
    private String roomId;         // 방 ID
    private Object offer;          // SDP offer
    private Object answer;         // SDP answer
    private Object candidate;      // ICE candidate
    private String senderSessionId; // 보낸 사람 세션 ID
}