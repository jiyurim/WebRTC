export default function Header({ roomId, isConnected, connectionState }) {
  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-6 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
            ✨ Orbit Meet
          </h1>
          <p className="text-purple-200 text-lg flex items-center gap-2">
            <span className="text-pink-400">🪐</span>
            Orbit: <span className="font-bold text-white">{roomId}</span>
          </p>
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md ${
            isConnected ? 'bg-green-500/20 border-green-400/30' : 'bg-purple-500/20 border-purple-400/30'
          } border`}>
            <span className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-400' : 'bg-purple-400'
            } animate-pulse shadow-lg`}></span>
            <span className={`${
              isConnected ? 'text-green-200' : 'text-purple-200'
            } font-medium`}>
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
          <p className="text-xs text-purple-300/50 mt-1">{connectionState}</p>
        </div>
      </div>
    </div>
  );
}