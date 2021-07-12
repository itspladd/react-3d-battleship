import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three';

// Helper functions
//import { hlp3 } from '../helpers/threeHelpers'

import GameViewer from '../classes/GameViewer'

export default function use3DBoard(canvasRef, gameStateRef) {
  // DEV - REMOVE LATER
  const playerId = 'p2';

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
    }
  });
  const messageData = useRef({ update: false, timestamp: Date.now() });
  //console.log('refreshing?')

  useEffect(() => {
    // === THREE.JS CODE START ===
/*     const [
      scene,
      camera,
      renderer,
      controls,
      raycaster
    ] = hlp3.setupScene(window, canvasRef.current);
    hlp3.positionCamera(camera);
    hlp3.limitCameraMovement(controls); // Add camera movement limits

    // Add axis helper
    scene.add(hlp3.makeAxesHelpers()) */


/*     // Create an object to hold data about the 3D board space.
    const gameBoard = hlp3.makeGameBoard(gameStateRef.current, playerId)
    // Set up the board! This means placing and coloring all the tiles.
    //const tiles = hlp3.makeTiles(gameStateRef.current, playerId);
    const lights = hlp3.makeLights();
    for (let light of lights) {
      scene.add(light)
    }
    gameBoard.addAllToScene(scene);
    hlp3.positionObject(gameBoard.ships[0], [10, 10], 120) */
    //scene.add(makeTestCube()); // Puts a test cube in the scene



/*     // Set up mouse
    const mouse = new THREE.Vector2(-1, -1);
    const onMouseMove = (event) => {
      //calculate mouse position
      if(event.button) {
        console.log(event.button)
      }
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
      const pointer = {
        normalizedPosition: [mouse.x, mouse.y],
        rawPosition: [event.clientX, event.clientY]
      }
      const cam = {
        position: camera.position,
        rotation: camera.quaternion
      }
      setInteractionData(prev => ({
        ...prev,
        pointer,
        camera: cam
      }))
    } */
    const viewer = new GameViewer(window, canvasRef, setViewerData)
    window.addEventListener('mousemove', viewer.onPointerMove, false);

/*     let previousHoverId = 'none';

    let animate = function () {
      requestAnimationFrame(animate);
      raycaster.setFromCamera(mouse, camera)
      const currentHover = hlp3.handleTileHover(raycaster, gameBoard, previousHoverId);
      if (currentHover.instanceId !== previousHoverId) {
        setInteractionData(prev => ({ ...prev, currentHover}));
      }
      previousHoverId = currentHover.instanceId
      // Update board if necessary
      if (messageData.current.update) {
        updateBoard(gameStateRef.current);
        messageData.current.update = false;
      }
      renderer.render(scene, camera);
    }; */
    viewer.animate();
    // === THREE.JS CODE END ===
  }, [])

  return [viewerData, messageData]
}

const updateBoard = (gameState) => {
  console.log('updated')
  console.log(gameState.players.p1.board.ships)
  // Update ship positions

  return true;
}