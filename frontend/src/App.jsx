import { useState } from 'react';
import Lobby from './pages/Lobby';
import VideoRoom from './pages/VideoRoom';

function App() {
  const [currentRoom, setCurrentRoom] = useState(null);

  if (currentRoom) {
    return (
      <VideoRoom 
        roomId={currentRoom} 
        onLeave={() => setCurrentRoom(null)} 
      />
    );
  }

  return <Lobby onJoinRoom={setCurrentRoom} />;
}

export default App;