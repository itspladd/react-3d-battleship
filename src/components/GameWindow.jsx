import { useState, useEffect, useRef } from 'react';

import '../styles/GameWindow.css'

// Hooks
import useGameEngine from '../hooks/useGameEngine'
import use3DBoard from '../hooks/use3DBoard'



// Component
export default function GameWindow() {
  //console.log('rendering gamewindow')

  // This ref will hold the DOM <canvas> element where we render the game.
  const renderCanvas = useRef(null);



  const [engine, moves, gameStateRef, makeMove] = useGameEngine();
  const [viewerData, messageDataRef, moveData] = use3DBoard(renderCanvas, gameStateRef);
  const [status, setStatus] = useState('Waiting');

  const moveAndUpdate = (move) => {
    setStatus('Move sent. Waiting for engine...');
    makeMove(move)
      .then(success => setStatus(`Move handled. Results: ${success && 'Valid'}. Updating board...`))
      .then(() => console.log(gameStateRef.current))
      .then(() => messageDataRef.current.update = true)
  }

  useEffect(() => {
    moveData && moveAndUpdate(moveData) && console.log('sending a move');
  }, [moveData])

  const handleClick = () => {
    console.log('handling click')
    const p1Move = {
      moveType: moves.MOVE_SHIP.NAME,
      playerID: 'p2',
      targetPlayerID: 'p2',
      shipID: 'ship0',
      position: [0, 0],
      angle: 180
    }
    moveAndUpdate(p1Move)

  }

  const shipList = [];
  gameStateRef.current.players && Object.values(gameStateRef.current.players).forEach(player => {
    const playerShips = [];
    Object.values(player.board.ships).forEach(ship => {
      playerShips.push(<li key={ship.id}>{ship.id}: {ship.segments[1].position}</li>)
    })
    shipList.push(
      <ul key={player.id}>
        <li>{player.id}: {player.name}</li>
        <ul>{playerShips}</ul>
      </ul>
    )
  })

  const makeString = (arr) => {
    if(!Array.isArray(arr)) {
      arr = Object.values(arr)
    }
    return arr.map(pos => Number.parseFloat(pos).toFixed(2)).join(', ');
  }

  const mouseData = viewerData.pointer.normalizedPosition;
  const cameraPos = viewerData.camera.position;
  const cameraRot = viewerData.camera.rotation;

  const mouseDataText = makeString(mouseData);
  const cameraPosText = makeString(cameraPos);
  const cameraRotText = makeString(cameraRot);

  let currentHoverInfo = [];
  for (let key in viewerData.currentHover) {
    currentHoverInfo.push(<li key={key}>{key}: {JSON.stringify(viewerData.currentHover[key])}</li>)
  }
  if(!currentHoverInfo.length) {
    currentHoverInfo = <li>No hoverable detected</li>
  }

  return (
    <div className="game-window">
      <div id="status">Status: {status}</div>
      <div id="info">
        <h2>Debug panel</h2>
        <p>Board update: {` ${messageDataRef.current.update}, ${messageDataRef.current.timestamp}`}</p>
        <ul>
          <li>Mouse: {mouseDataText}</li>
          <li>Camera pos: {cameraPosText}</li>
          <li>Camera rot: {cameraRotText}</li>
        </ul>
        <ul>
          {currentHoverInfo}
        </ul>
        <button onClick={() => handleClick()}>Place a ship</button>
        {shipList}
        {engine && `Engine timestamp: ${engine.timestamp}`}
      </div>
      {/* Assign the renderCanvas ref to this canvas element! */}
      <canvas ref={renderCanvas} />
    </div>
  )
}