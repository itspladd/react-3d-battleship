import { useState, useEffect, useRef } from 'react';

import '../styles/GameWindow.css'

// Hooks
import useGameEngine from '../hooks/useGameEngine'
import use3DBoard from '../hooks/use3DBoard'



// Component
export default function GameWindow() {

  // This ref will hold the DOM <canvas> element where we render the game.
  const renderCanvas = useRef(null);

  // Dummy players object to hold dev data.
  const players = [
    { id: 'p1', name: 'Trapezius' },
    { id: 'p2', name: 'Tautrion' }
  ];

  const [engine, moves, gameState, setGameState] = useGameEngine(players);
  const [mouseData] = use3DBoard(renderCanvas, gameState);
  let buttonResult = "Click me";

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
    engine.inputMove(p1Move)
      .then(results => setGameState(results.gameState))
  }

  const shipList = [];
  Object.values(gameState.players).forEach(player => {
    const playerShips = [];
    Object.values(player.board.ships).forEach(ship => {
      playerShips.push(<li>{ship.id}: {ship.segments[1].position}</li>)
    })
    shipList.push(
      <ul>
        <li>Player: {player.id}</li>
        <ul>{playerShips}</ul>
      </ul>
      )
  })

  return (
    <div className="game-window">
      <div id="info">
        <h2>Debug panel</h2>
        <span>
          Info: {mouseData && mouseData.join(', ')}
        </span>
        <p>
          <button onClick={() => handleClick()}>Place a ship</button>
          <p>
            {shipList}
          </p>
        </p>
      </div>
      <canvas ref={renderCanvas} />
      {/* Assign the renderCanvas ref to this canvas element! */}
    </div>
  )
}