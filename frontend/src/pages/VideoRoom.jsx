import { useRef, useEffect } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import Header from '../components/Header';
import VideoGrid from '../components/VideoGrid';
import ControlPanel from '../components/ControlPanel';
import SpaceBackground from '../components/SpaceBackground';

export default function VideoRoom({ roomId, onLeave }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const {
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
  } = useWebRTC(roomId);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      console.log("✅ 로컬 비디오 연결됨");
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(err => {
        console.warn("⚠️ 오디오 자동 재생 차단됨");
      });
      console.log("✅ 원격 비디오 연결됨");
    }
  }, [remoteStream]);

  const handleLeave = () => {
    endCall();
    onLeave();
  };

  const handleRemoteVideoClick = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.play()
        .then(() => console.log("✅ 오디오 재생"))
        .catch(err => console.error("❌ 재생 실패:", err));
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0014] relative overflow-hidden">
      <SpaceBackground />

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        <Header 
          roomId={roomId}
          isConnected={isConnected}
          connectionState={connectionState}
        />

        <VideoGrid
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          localStream={localStream}
          remoteStream={remoteStream}
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          onRemoteVideoClick={handleRemoteVideoClick}
        />

        <ControlPanel
          localStream={localStream}
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isScreenSharing={isScreenSharing}
          isConnected={isConnected}
          onStartTransmission={initializeMedia}
          onConnect={createOffer}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
          onToggleScreenShare={toggleScreenShare}
          onEndTransmission={endCall}
          onLeave={handleLeave}
        />
      </div>
    </div>
  );
}