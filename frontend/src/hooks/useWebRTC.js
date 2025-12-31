import { useEffect, useRef, useState, useCallback } from 'react';
import { useStompClient } from './useStompClient';

export const useWebRTC = (roomId) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionState, setConnectionState] = useState('new');
  
  const peerConnectionRef = useRef(null);
  const iceCandidateQueueRef = useRef([]);

  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      {
        urls: [
          "turn:openrelay.metered.ca:80",
          "turn:openrelay.metered.ca:443",
          "turn:openrelay.metered.ca:443?transport=tcp"
        ],
        username: "openrelayproject",
        credential: "openrelayproject"
      },
      {
        urls: [
          "turn:numb.viagenie.ca",
          "turn:numb.viagenie.ca:3478?transport=tcp"
        ],
        username: "webrtc@live.com",
        credential: "muazkh"
      },
      {
        urls: "turn:relay.metered.ca:80",
        username: "85d6ac087f8e239d79e9cf28",
        credential: "pDfJR3VUCqFMp4lF"
      },
      {
        urls: "turn:relay.metered.ca:443",
        username: "85d6ac087f8e239d79e9cf28",
        credential: "pDfJR3VUCqFMp4lF"
      }
    ],
    iceCandidatePoolSize: 10
  };

  // ⚠️ sendMessage를 ref로 저장
  const sendMessageRef = useRef(null);

  // Signaling 메시지 처리를 useCallback으로 메모이제이션
  const handleSignalingMessage = useCallback(async (data) => {
    try {
        switch (data.type) {
        case "offer":
            console.log("📩 Offer 수신");
            await handleOffer(data.offer);
            break;

        case "answer":
            console.log("📩 Answer 수신");
            await handleAnswer(data.answer);
            break;

        case "ice":
            await handleIceCandidate(data.candidate);
            break;

        case "end":  // ⚠️ 새로 추가!
            console.log("📞 상대방이 통화를 종료했습니다");
            handleRemoteEnd();
            break;

        default:
            console.log("알 수 없는 메시지:", data.type);
        }
    } catch (error) {
        console.error("Signaling 처리 에러:", error);
    }
    }, []);

  // STOMP 연결
  const { isConnected, sendMessage } = useStompClient(
    roomId,
    handleSignalingMessage
  );

  // sendMessage를 ref에 저장
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      console.log("🎥 로컬 미디어 스트림 획득");
      return stream;
    } catch (err) {
      if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
        try {
          console.warn("⚠️ 오디오 없이 비디오만 시도");
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
          
          setLocalStream(stream);
          console.log("🎥 로컬 미디어 스트림 획득 (비디오만)");
          return stream;
        } catch (videoErr) {
          console.error("❌ 비디오도 사용할 수 없습니다", videoErr);
          alert("카메라를 찾을 수 없습니다.");
          throw videoErr;
        }
      } else {
        alert(`미디어 장치 오류: ${err.message}`);
        throw err;
      }
    }
  };

  const createPeerConnection = (stream) => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const pc = new RTCPeerConnection(iceServers);
    console.log("🔗 RTCPeerConnection 생성");

    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const candidateStr = event.candidate.candidate;
        let candidateType = 'unknown';
        if (candidateStr.includes('typ host')) candidateType = 'host';
        if (candidateStr.includes('typ srflx')) candidateType = 'srflx (STUN)';
        if (candidateStr.includes('typ relay')) candidateType = 'relay (TURN)';

        console.log(`🧊 ICE Candidate [${candidateType}]`);

        // ⚠️ ref를 통해 sendMessage 호출
        if (sendMessageRef.current) {
          sendMessageRef.current({
            type: "ice",
            roomId: roomId,
            candidate: event.candidate
          });
        }
      } else {
        console.log("✅ ICE Candidate 수집 완료");
      }
    };

    pc.ontrack = (event) => {
      console.log("🎬 원격 트랙 수신:", event.track.kind);
      setRemoteStream(event.streams[0]);
    };

    pc.oniceconnectionstatechange = () => {
        console.log("🔌 ICE 연결 상태:", pc.iceConnectionState);
        
        if (pc.iceConnectionState === 'failed') {
        console.error("❌ ICE 연결 실패");
        }
        
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        console.log("✅ ICE 연결 성공!");
        }
        
        // ⚠️ 새로 추가: 연결 끊김 감지
        if (pc.iceConnectionState === 'disconnected') {
        console.warn("⚠️ 연결이 끊어졌습니다");
        setTimeout(() => {
            if (pc.iceConnectionState === 'disconnected') {
            console.log("🔌 상대방 연결 끊김 확인");
            handleRemoteEnd();
            }
        }, 3000); // 3초 후에도 disconnected면 종료 처리
        }
        
        if (pc.iceConnectionState === 'closed') {
        console.log("🔌 연결 닫힘");
        setRemoteStream(null);
        }
    };

    pc.onconnectionstatechange = () => {
        console.log("🔗 전체 연결 상태:", pc.connectionState);
        setConnectionState(pc.connectionState);
        
        // ⚠️ 새로 추가: 연결 상태 감지
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        console.warn("⚠️ 연결 문제 발생");
        }
        
        if (pc.connectionState === 'closed') {
        console.log("🔌 PeerConnection 닫힘");
        setRemoteStream(null);
        }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const createOffer = async () => {
    if (!isConnected) {
      alert("STOMP 서버에 연결되지 않았습니다.");
      return;
    }

    try {
      const stream = localStream || await initializeMedia();
      const pc = createPeerConnection(stream);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // ⚠️ ref를 통해 sendMessage 호출
      if (sendMessageRef.current) {
        sendMessageRef.current({
          type: "offer",
          roomId: roomId,
          offer: offer
        });
      }

      console.log("📤 Offer 전송");
    } catch (error) {
      console.error("Offer 생성 에러:", error);
    }
  };

  const handleOffer = async (offer) => {
    try {
      const stream = localStream || await initializeMedia();
      const pc = createPeerConnection(stream);

      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      while (iceCandidateQueueRef.current.length > 0) {
        const candidate = iceCandidateQueueRef.current.shift();
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("✅ 큐에서 ICE Candidate 추가");
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // ⚠️ ref를 통해 sendMessage 호출
      if (sendMessageRef.current) {
        sendMessageRef.current({
          type: "answer",
          roomId: roomId,
          answer: answer
        });
        console.log("📤 Answer 전송");
      } else {
        console.error("❌ sendMessage가 없음!");
      }
    } catch (error) {
      console.error("Offer 처리 에러:", error);
    }
  };

  const handleAnswer = async (answer) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );

      while (iceCandidateQueueRef.current.length > 0) {
        const candidate = iceCandidateQueueRef.current.shift();
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("✅ 큐에서 ICE Candidate 추가");
      }
    } catch (error) {
      console.error("Answer 처리 에러:", error);
    }
  };

  const handleIceCandidate = async (candidate) => {
    if (peerConnectionRef.current) {
      const candidateStr = candidate.candidate;
      let candidateType = 'unknown';
      if (candidateStr.includes('typ host')) candidateType = 'host';
      if (candidateStr.includes('typ srflx')) candidateType = 'srflx (STUN)';
      if (candidateStr.includes('typ relay')) candidateType = 'relay (TURN)';
      console.log(`📩 ICE Candidate 수신 [${candidateType}]`);

      if (peerConnectionRef.current.remoteDescription) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        console.log("⏸️ ICE Candidate 큐에 저장");
        iceCandidateQueueRef.current.push(candidate);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });

        const screenVideoTrack = screenStream.getVideoTracks()[0];
        const screenAudioTrack = screenStream.getAudioTracks()[0];

        setLocalStream(screenStream);

        if (peerConnectionRef.current) {
          const videoSender = peerConnectionRef.current.getSenders()
            .find(s => s.track && s.track.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(screenVideoTrack);
            console.log("🖥️ 화면 공유 비디오 트랙으로 교체");
          }

          if (screenAudioTrack) {
            const audioSender = peerConnectionRef.current.getSenders()
              .find(s => s.track && s.track.kind === 'audio');
            if (audioSender) {
              audioSender.replaceTrack(screenAudioTrack);
              console.log("🔊 시스템 오디오 트랙으로 교체");
            }
          }
        }

        screenVideoTrack.onended = () => {
          switchBackToCamera();
        };

        setIsScreenSharing(true);
        console.log("🖥️ 화면 공유 시작");
      } else {
        await switchBackToCamera();
      }
    } catch (error) {
      console.error("❌ 화면 공유 오류", error);
    }
  };

  const switchBackToCamera = async () => {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      const cameraVideoTrack = cameraStream.getVideoTracks()[0];
      const cameraAudioTrack = cameraStream.getAudioTracks()[0];

      setLocalStream(cameraStream);

      if (peerConnectionRef.current) {
        const videoSender = peerConnectionRef.current.getSenders()
          .find(s => s.track && s.track.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(cameraVideoTrack);
          console.log("🎥 카메라 비디오 트랙으로 교체");
        }

        const audioSender = peerConnectionRef.current.getSenders()
          .find(s => s.track && s.track.kind === 'audio');
        if (audioSender && cameraAudioTrack) {
          audioSender.replaceTrack(cameraAudioTrack);
          console.log("🎤 마이크 오디오 트랙으로 교체");
        }
      }

      setIsScreenSharing(false);
      console.log("🎥 카메라로 전환");
    } catch (error) {
      console.error("카메라 전환 에러:", error);
    }
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = () => {
    console.log("📞 통화 종료");
  
    // 상대방에게 종료 알림 전송
    if (sendMessageRef.current) {
        sendMessageRef.current({
        type: "end",
        roomId: roomId
        });
        console.log("📤 종료 메시지 전송");
    }
    
    // 로컬 스트림 중지
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    
    // PeerConnection 닫기
    if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
    }
    
    // 상태 초기화
    setLocalStream(null);
    setRemoteStream(null);
    peerConnectionRef.current = null;
    iceCandidateQueueRef.current = [];
    setConnectionState('closed');
  };

  const handleRemoteEnd = () => {
    console.log("🔌 상대방 연결 종료");
    
    // 원격 스트림만 제거
    setRemoteStream(null);
    
    // PeerConnection 종료
    if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
    }
    
    // 연결 상태 초기화
    setConnectionState('disconnected');
    iceCandidateQueueRef.current = [];
    
    alert("상대방이 통화를 종료했습니다.");
};

  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  return {
    localStream,
    remoteStream,
    isConnected,
    isMuted,
    isVideoOff,
    isScreenSharing,
    connectionState,
    initializeMedia,
    createOffer,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    endCall
  };
};