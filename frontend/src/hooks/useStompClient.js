import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

export const useStompClient = (roomId, onMessage) => {
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef(null);
  const sessionIdRef = useRef(null);

  useEffect(() => {
    const sock = new SockJS('http://localhost:8080/signal');
    const client = Stomp.over(sock);

    client.debug = null;

    client.connect(
      {},
      (frame) => {
        console.log("✅ STOMP 연결 성공");
        setIsConnected(true);

        // 세션 ID 추출
        try {
          const url = client.ws._transport.url;
          const parts = url.split('/');
          sessionIdRef.current = parts[parts.length - 2];
          console.log("📱 세션 ID:", sessionIdRef.current);
        } catch (e) {
          console.warn("세션 ID 추출 실패");
        }

        // 방 구독
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const data = JSON.parse(message.body);

          console.log("📨 원본 메시지:", {
            type: data.type,
            senderSessionId: data.senderSessionId,
            mySessionId: sessionIdRef.current
          });

          // ⚠️ 여기가 중요! 세션 ID가 정확히 일치하는지 확인
          if (data.senderSessionId && data.senderSessionId === sessionIdRef.current) {
            console.log("⏭️ 내가 보낸 메시지 무시:", data.type);
            return;
          }

          console.log("📩 메시지 처리:", data.type);
          onMessage(data);
        });
      },
      (error) => {
        console.error("❌ STOMP 연결 실패:", error);
        setIsConnected(false);
      }
    );

    stompClientRef.current = client;

    return () => {
      if (client && client.connected) {
        client.disconnect(() => {
          console.log("🔌 STOMP 연결 종료");
        });
      }
    };
  }, [roomId, onMessage]);

  const sendMessage = (message) => {
    if (stompClientRef.current && isConnected) {
      // ⚠️ 세션 ID를 메시지에 포함
      const messageWithSession = {
        ...message,
        senderSessionId: sessionIdRef.current
      };

      stompClientRef.current.send(
        "/app/signal",
        {},
        JSON.stringify(messageWithSession)
      );
      console.log("📤 메시지 전송:", message.type, "세션:", sessionIdRef.current);
    } else {
      console.warn("⚠️ STOMP 연결되지 않음");
    }
  };

  return {
    isConnected,
    sendMessage,
    sessionId: sessionIdRef.current
  };
};