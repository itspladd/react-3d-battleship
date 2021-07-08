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
  const [interactionData, messageData] = use3DBoard(renderCanvas, gameStateRef);

  const handleClick = () => {
    console.log('handling click')
    const p1Move = {
      moveType: moves.MOVE_SHIP.NAME,
      playerID: 'p1',
      targetPlayerID: 'p1',
      shipID: 'ship0',
      position: [0, 0],
      angle: 180
    }
    makeMove(p1Move)
      .then(results => console.log('move done. results:', results))
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

  const mouseData = interactionData.pointer.normalizedPosition;
  const mouseDataText = mouseData.map(pos => Number.parseFloat(pos).toFixed(2)).join(', ');
  const currentTileInfo = [];
  for (let key in interactionData.currentHover) {
    currentTileInfo.push(<li>{key}: {JSON.stringify(interactionData.currentHover[key])}</li>)
  }
  return (
    <div className="game-window">
      <div id="info">
        <h2>Debug panel</h2>
        <p>Board update: {` ${messageData.current.update}, ${messageData.current.timestamp}`}</p>
        <ul>
          <li>Mouse: {mouseDataText}</li> 
        </ul>
        {interactionData.currentHover.instanceId}
        <ul>
          {currentTileInfo}
        </ul>
        <button onClick={() => handleClick()}>Place a ship</button>
        <button onClick={() => messageData.current.update = true}>Tell board to update</button>
        {shipList}
        {engine && `Engine timestamp: ${engine.timestamp}`}
      </div>
      {/* Assign the renderCanvas ref to this canvas element! */}
      <canvas ref={renderCanvas} />
    </div>
  )
}