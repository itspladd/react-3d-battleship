// Modules
import { useState, useEffect } from 'react';
import socketClient from 'socket.io-client';

// Components
import GameWindow from './GameWindow';

// Constants
import { SOCKET_DATA } from '../constants/socket'

import '../styles/App.css';

function App() {
// socket.io setup for future multiplayer functionality
/*  const [state, setState] = useState({
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
  
  // Add this component to the app to show status of socket connection if there's a socket server running
  const SocketStatus = () => (
    <p>
      Socket server: { SOCKET_DATA.SERVER } |&nbsp;
      { !state.socketConnected && 'Connecting to server...' }
      { state.socketConnected && 'Connection established!' }
    </p>
  )*/

  return (
    <div className="App">
      <header className="App-header">
        <div className="alert-banner">
          <h2>Hey there! Thanks for running ShootyBoats!</h2>
          <p>Here's what you can expect from this project in its current state:</p>
          <ul>
            <li>This is an early-stage experiment, <strong>not a full playable game</strong>.</li>
            <li>The controls are still prone to bugs. If they feel broken, try <strong>refreshing the page</strong>!</li>
            <li>Currently, you can move the board and place your "ships" on your board (the left-hand set of light blue tiles)</li>
            <li>The right-hand side of the board will detect mouse hover on its tiles, but is otherwise inactive.</li>
          </ul>
          <p></p>
        </div>
      </header>

      <GameWindow />
    </div>
  );
}

export default App;
