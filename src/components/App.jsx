// Modules
import { useState, useEffect } from 'react';
import socketClient from 'socket.io-client';

// Components
import GameWindow from './GameWindow';

// Constants
import { SOCKET_DATA } from '../constants/socket'

import '../styles/App.css';

function App() {
  const [state, setState] = useState({
    socketConnected: false,
  })


  useEffect(() => {
    const socket = socketClient(SOCKET_DATA.SERVER)

    socket.on('connection', () => {
      setState(prev => ({
        ...prev,
        socketConnected: true,
        socket
        }
      ))
    });

    return function cleanup() {
      socket.disconnect();
    }
  }, [])

  return (
    <div className="App">
      <header>
        <p>
          Socket server: { SOCKET_DATA.SERVER } |&nbsp;
          { !state.socketConnected && 'Connecting to server...' }
          { state.socketConnected && 'Connection established!' }
        </p>

      </header>
      <GameWindow />
    </div>
  );
}

export default App;
