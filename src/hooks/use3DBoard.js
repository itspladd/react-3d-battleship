import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three';

import GameViewer from '../classes/GameViewer'

export default function use3DBoard(canvasRef, gameStateRef) {
  // DEV - REMOVE LATER
  const playerId = 'p2';
  /************ END DEV DATA*/

  const [viewerData, setViewerData] = useState({
    pointer: {
      normalizedPosition: [-1, -1],
      rawPosition: [0, 0]
    },
    camera: {
      position: [0, 0, 0],
      rotation: [0, 0, 0, 0]
    },
    currentHover: {
      instanceId: 'none', // ID to find this in the 'tiles' mesh
      playerId: null, // ID of the owning player
      worldPosition: null, // Position on the overall visible world
      boardPosition: null, // Position on the owning player's board
      hoverable: null
    },
    currentSelect: {
      objectId: 'none',
      playerId: null,
      ownerID: null,
    },
    selectStack: []
  });
  const [moveData, setMoveData] = useState(null)
  const messageDataRef = useRef({ update: false, timestamp: Date.now() });
  //console.log('refreshing?')

  useEffect(() => {
    // === THREE.JS CODE START ===


    const viewer = new GameViewer(window, canvasRef, setViewerData, messageDataRef, setMoveData)
    viewer.initGame(gameStateRef, playerId)

    viewer.animate();
    // === THREE.JS CODE END ===
  }, [])

  return [viewerData, messageDataRef, moveData]
}

const updateBoard = (gameState) => {
  console.log('updated')
  console.log(gameState.players.p1.board.ships)
  // Update ship positions

  return true;
}