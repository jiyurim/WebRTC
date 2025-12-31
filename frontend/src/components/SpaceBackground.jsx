export default function SpaceBackground() {
  return (
    <>
      {/* 우주 배경 */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-blue-900/10 to-pink-900/20"></div>
      
      {/* 별들 효과 */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-[10%] left-[20%] w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-[30%] left-[70%] w-1 h-1 bg-purple-300 rounded-full animate-pulse"></div>
        <div className="absolute top-[60%] left-[15%] w-1 h-1 bg-pink-300 rounded-full animate-pulse"></div>
        <div className="absolute top-[80%] left-[85%] w-1 h-1 bg-blue-300 rounded-full animate-pulse"></div>
        <div className="absolute top-[20%] left-[50%] w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-[70%] left-[40%] w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-[45%] left-[90%] w-1 h-1 bg-pink-400 rounded-full animate-pulse"></div>
      </div>
    </>
  );
}