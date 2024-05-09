import { useState, useEffect, useRef } from 'react';

import '../styles/GameWindow.css'

// Hooks
import useGameEngine from '../hooks/useGameEngine'
import use3DBoard from '../hooks/use3DBoard'

import DebugPanel from './DebugPanel';
import ControlsPanel from './ControlsPanel';

// Component
export default function GameWindow() {
  // DEV - REMOVE LATER
  //console.log('rendering gamewindow')
  const playerId = 'p2';
  /************ END DEV DATA*/

  // This ref will hold the DOM <canvas> element where we render the game.
  const renderCanvas = useRef(null);


  const [engine, moves, gameStateRef, makeMove] = useGameEngine();
  const [viewerData, messageDataRef, moveData] = use3DBoard(renderCanvas, gameStateRef, engine, playerId);
  const [status, setStatus] = useState('Waiting');

  const moveAndUpdate = (move) => {
    setStatus('Move sent. Waiting for engine...');
    makeMove(move)
      .then(results => {
        //console.log(results)
        setStatus({
          msg: `Move handled. Results: ${results.valid && 'Valid'}. Updating board...`,
          results
        })
      })
      .then(() => messageDataRef.current.update = true)
      .catch(err => console.log("yo"))
  }

  // When moveData changes, send a move to the engine.
  // All moves should be sent in this way.
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

  const markPlayerReady = () => {
    if(engine.players[playerId].board.allShipsPlaced) {

    }
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

  // TODO: Set up the debugging info so it only recalculates
  // when a move is reported.
  return (
    <div className="game-window">
      <div className="panels">
        <DebugPanel
          status={status.msg}
          gameStateRef={gameStateRef}
          viewerData={viewerData}
          messageDataRef={messageDataRef}
          debugClick={handleClick}
        />
        <ControlsPanel />

      </div>

{/*       <div id="fps">
        <span>FPS:{viewerData.fps}</span>
      </div> */}
      {/* Assign the renderCanvas ref to this canvas element! */}
      <canvas ref={renderCanvas} />
    </div>
  )
}