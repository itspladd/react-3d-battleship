import { useState, useEffect, useRef } from 'react';

import '../styles/GameWindow.css'

// Hooks
import useGameEngine from '../hooks/useGameEngine'

// Helpers
import { boardCoordinatesToSceneCoordinates } from '../helpers/boardHelpers'
import { EdgesGeometry } from 'three';

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
  const [renderer, setRenderer] = useState();
  const [mouseData, setMouse] = useState([]);
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

  return (
    <div className="game-window">
      <div id="info">
        Info: {mouseData && mouseData.join(', ')}
      </div>
      <canvas ref={renderCanvas} />
      {/* Assign the renderCanvas ref to this canvas element! */}
      <button onClick={() => handleClick()}>{buttonResult}</button>
      <p>{gameState && JSON.stringify(gameState)}</p>
    </div>
  )
}