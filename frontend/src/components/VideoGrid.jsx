export default function VideoGrid({ 
  localVideoRef, 
  remoteVideoRef, 
  localStream, 
  remoteStream,
  isMuted,
  isVideoOff,
  onRemoteVideoClick 
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      
      {/* 내 비디오 */}
      <div className="group relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-4 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-3xl">🌟</span> 
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ME
            </span>
            {isMuted && <span className="text-lg">🔇</span>}
            {isVideoOff && <span className="text-lg">📷</span>}
          </h3>
          <div className="relative rounded-2xl overflow-hidden aspect-video border border-white/10">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {!localStream && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-7xl mb-4 animate-bounce">🪐</div>
                  <p className="text-xl text-purple-200">Camera Off</p>
                </div>
              </div>
            )}
            <div className="absolute top-3 right-3 backdrop-blur-md bg-black/30 px-3 py-1 rounded-full border border-white/20">
              <span className="text-white text-sm font-medium">You</span>
            </div>
          </div>
        </div>
      </div>

      {/* 상대방 비디오 */}
      <div className="group relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-4 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-3xl">💫</span>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              YOU
            </span>
          </h3>
          <div 
            className="relative rounded-2xl overflow-hidden aspect-video border border-white/10 cursor-pointer"
            onClick={onRemoteVideoClick}
          >
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {!remoteStream && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-7xl mb-4 animate-pulse">🌙</div>
                  <p className="text-xl text-blue-200">Waiting for connection...</p>
                  <p className="text-sm text-blue-300/70 mt-2">Click to unmute audio</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}