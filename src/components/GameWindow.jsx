import { useState, useEffect, useRef } from 'react';

import '../styles/GameWindow.css'

// Hooks
import useGameEngine from '../hooks/useGameEngine'
import use3DBoard from '../hooks/use3DBoard'

import DebugPanel from './DebugPanel';

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
  const [showControls, setShowControls] = useState(true)

  const moveAndUpdate = (move) => {
    setStatus('Move sent. Waiting for engine...');
    makeMove(move)
      .then(results => {
        console.log(results)
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
      <div id="status">Status: {status.msg}</div>
      <div id="controls">
        <p><strong>---- The controls still have some bugs. If they feel broken, try refreshing the page! ----</strong></p>
        <p>This is an early-stage experiment, <strong>not a full playable game</strong>. Currently, you can move the board and place your "ships" on your board (the left-hand set of light blue tiles)</p>
        <p>The right-hand side of the board will detect mouse hover on its tiles, but is otherwise inactive.</p>
        <div id="control-columns">
          <div class="control-col">
            <h3>Camera controls:</h3>
            <ul>
              <li>Hold left click to pan camera</li>
              <li>Hold right click to rotate camera</li>
              <li>Scroll to zoom</li>
            </ul>
          </div>
          <div class="control-col">
            <h3>Ship placement:</h3>
            <ul>
              <li>Left-click a ship to pick it up</li>
              <li>Scroll to rotate a ship while it's being held</li>
              <li>While holding a ship, click a valid tile to place the ship</li>
              <li>The ship must fit inside the light blue squares on your board without overlapping other ships!</li>
            </ul>
          </div>
        </div>

      </div>
      <DebugPanel
        gameStateRef={gameStateRef}
        viewerData={viewerData}
        messageDataRef={messageDataRef}
        debugClick={handleClick} />
{/*       <div id="fps">
        <span>FPS:{viewerData.fps}</span>
      </div> */}
      {/* Assign the renderCanvas ref to this canvas element! */}
      <canvas ref={renderCanvas} />
    </div>
  )
}