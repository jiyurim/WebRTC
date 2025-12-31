export default function ControlPanel({
  localStream,
  isMuted,
  isVideoOff,
  isScreenSharing,
  isConnected,
  onStartTransmission,
  onConnect,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onEndTransmission,
  onLeave
}) {
  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-6">
      <div className="flex flex-wrap justify-center gap-4">
        
        {!localStream ? (
          <button 
            onClick={onStartTransmission}
            className="group relative px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden transform hover:scale-105 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative text-white flex items-center gap-2">
              <span className="text-2xl">📡</span>
              Start Transmission
            </span>
          </button>
        ) : (
          <>
            <button 
              onClick={onConnect}
              disabled={!isConnected}
              className="group relative px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative text-white flex items-center gap-2">
                <span className="text-2xl">🔗</span>
                Connect
              </span>
            </button>

            <button 
              onClick={onToggleMute}
              className="group relative px-6 py-4 rounded-2xl font-bold text-lg overflow-hidden transform hover:scale-105 transition-all duration-300"
            >
              <div className={`absolute inset-0 ${
                isMuted 
                  ? 'bg-gradient-to-r from-red-500 to-rose-500'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}></div>
              <span className="relative text-white text-2xl">
                {isMuted ? '🔇' : '🎤'}
              </span>
            </button>

            <button 
              onClick={onToggleVideo}
              className="group relative px-6 py-4 rounded-2xl font-bold text-lg overflow-hidden transform hover:scale-105 transition-all duration-300"
            >
              <div className={`absolute inset-0 ${
                isVideoOff
                  ? 'bg-gradient-to-r from-red-500 to-rose-500'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}></div>
              <span className="relative text-white text-2xl">
                {isVideoOff ? '📷' : '🎥'}
              </span>
            </button>

            <button 
              onClick={onToggleScreenShare}
              className="group relative px-6 py-4 rounded-2xl font-bold text-lg overflow-hidden transform hover:scale-105 transition-all duration-300"
            >
              <div className={`absolute inset-0 ${
                isScreenSharing
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500'
              }`}></div>
              <span className="relative text-white text-2xl">
                🖥️
              </span>
            </button>

            <button 
              onClick={onEndTransmission}
              className="group relative px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden transform hover:scale-105 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-pink-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative text-white flex items-center gap-2">
                <span className="text-2xl">⏸️</span>
                End Transmission
              </span>
            </button>
          </>
        )}

        <button 
          onClick={onLeave}
          className="group relative px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden transform hover:scale-105 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="relative text-white flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            Leave Orbit
          </span>
        </button>
      </div>
    </div>
  );
}