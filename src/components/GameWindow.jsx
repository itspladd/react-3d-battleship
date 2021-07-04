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



  const [engine, moves, gameState, makeMove] = useGameEngine();
  const [mouseData, currentTileData] = use3DBoard(renderCanvas, gameState);

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
  gameState.players && Object.values(gameState.players).forEach(player => {
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

  const mouseDataText = mouseData.map(pos => Number.parseFloat(pos).toFixed(2)).join(', ');
  const currentTileInfo = [];
  for (let key in currentTileData) {
    currentTileInfo.push(<li>{key}: {currentTileData[key]}</li>)
  }
  return (
    <div className="game-window">
      <div id="info">
        <h2>Debug panel</h2>
        <ul>
          <li>Mouse: {mouseDataText}</li> 
        </ul>
        {currentTileInfo}
        <button onClick={() => handleClick()}>Place a ship</button>
        {shipList}
        {engine && `Engine timestamp: ${engine.timestamp}`}
      </div>
      {/* Assign the renderCanvas ref to this canvas element! */}
      <canvas ref={renderCanvas} />
    </div>
  )
}