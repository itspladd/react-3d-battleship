// Modules
import { useState, useEffect } from 'react';
import socketClient from 'socket.io-client';

// Constants
import { SOCKET_DATA } from '../constants/socket'

import logo from '../logo.svg';
import '../styles/App.css';

function App() {
  const [state, setState] = useState({
    socketConnected: false,
  })


  useEffect(() => {
    console.log('Running')
    const socket = socketClient(SOCKET_DATA.SERVER)

    socket.on('connection', () => {
      setState(prev => ({
        ...prev,
        socketConnected: true
        }
      ))
    });

    return function cleanup() {
      socket.disconnect();
    }
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <p>
          Socket server: { SOCKET_DATA.SERVER }
        </p>
        <p>
          { !state.socketConnected && 'Connecting to server...' }
          { state.socketConnected && 'Connection established!' }
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
