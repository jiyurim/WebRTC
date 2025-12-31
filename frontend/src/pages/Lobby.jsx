import { useState } from 'react';

export default function Lobby({ onJoinRoom }) {
  const [roomId, setRoomId] = useState('');

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      onJoinRoom(roomId);
    } else {
      alert("Orbit ID를 입력하세요!");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0014] relative overflow-hidden flex items-center justify-center p-4">
      {/* 우주 배경 */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-blue-900/20 to-pink-900/30"></div>
      
      {/* 별들 애니메이션 */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* 큰 행성 배경 */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* 글로우 효과 */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur opacity-30 animate-pulse"></div>
        
        {/* 메인 카드 */}
        <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-10">
          
          <div className="text-center mb-8">
            {/* 타이틀 */}
            <div className="mb-6">
              <h1 className="text-6xl font-bold mb-2">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Orbit Meet
                </span>
              </h1>
              <div className="flex justify-center gap-4 text-4xl mt-5">
                <span className="animate-bounce">🌟</span>
                <span className="animate-bounce" style={{animationDelay: '0.1s'}}>💫</span>
                <span className="animate-bounce" style={{animationDelay: '0.2s'}}>✨</span>
              </div>
            </div>
            <p className="text-purple-200 text-lg">Choose your orbit to connect</p>
          </div>
          
          <div className="space-y-4">
            {/* 입력 필드 */}
            <div className="relative">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter orbit code (e.g., moon-01)"
                className="w-full px-6 py-4 bg-white/10 backdrop-blur-md border-2 border-purple-400/30 rounded-2xl focus:border-pink-400/50 focus:outline-none text-white placeholder-purple-300/50 text-lg font-medium transition-all duration-300"
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl">
                🪐
              </div>
            </div>
            
            {/* 입장 버튼 */}
            <button
              onClick={handleJoinRoom}
              disabled={!roomId.trim()}
              className="group relative w-full py-4 rounded-2xl font-bold text-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative text-white flex items-center justify-center gap-2">
                <span className="text-2xl">🚀</span>
                Connect to Orbit
              </span>
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-purple-300/70">
            <p>✨ Welcome ✨</p>
          </div>
        </div>
      </div>
    </div>
  );
}