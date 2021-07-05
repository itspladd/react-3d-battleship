import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls'

// Helpers
import { boardCoordinatesToSceneCoordinates } from '../helpers/boardHelpers'

// Constants
import { BOARD_DIMENSIONS, TILE_GEOMETRY, MATERIALS, COLORS } from '../constants/3DBOARD';

const {
  ROWS_TOP,
  ROWS_BOTTOM,
  COLUMNS_LEFT,
  COLUMNS_RIGHT,
  COLUMNS_BETWEEN
} = BOARD_DIMENSIONS;
const { TILE_RADIUS, TILE_HEIGHT, TILE_THICKNESS, TILE_BASE } = TILE_GEOMETRY;

// Set up colors
const boardBaseColor = new THREE.Color(COLORS.PLAYER_BOARD_TILE_BASE_COLOR);
const boardHoverColor = new THREE.Color(COLORS.PLAYER_BOARD_TILE_HOVER_COLOR);
const tileFillerColor = new THREE.Color(COLORS.TILE_NONINTERACTIVE_COLOR)

// Set up materials
// Make the material for all tiles
let tileMaterial = new THREE.MeshStandardMaterial({
  ...MATERIALS.TILE_MATERIAL
});



export default function use3DBoard(canvasRef, gameStateRef) {
  const [interactionData, setInteractionData] = useState({
    pointer: {
      normalizedPosition: [-1, -1],
      rawPosition: [0, 0]
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
  console.log('refreshing?')

  // Set up the basic three.js stuff
  let scene, camera, renderer, controls;

  useEffect(() => {
    // === THREE.JS CODE START ===
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    controls = new MapControls(camera, canvasRef.current)
    controls.screenSpacePanning = true;

    // Uncomment this to put angle limits on the camera.
    controls.maxAzimuthAngle = 0;
    controls.minAzimuthAngle = 0;
    controls.maxPolarAngle = Math.PI * .8;
    controls.minPolarAngle = Math.PI / 2;

    renderer.setSize(window.innerWidth, window.innerHeight);

    // Make and orient the basic hex geometry for all tiles
    const hexGeometry = new THREE.CylinderBufferGeometry(TILE_RADIUS * .95, TILE_RADIUS, TILE_THICKNESS, 6);
    hexGeometry.rotateX(Math.PI * 0.5) // Turn the tile so it's laying "flat"
    hexGeometry.rotateZ(Math.PI * 0.5) // Turn the tile to "point" sideways

    // Create the instanced mesh for all tiles
    const { totalRows, totalCols } = determineTotalTiles(gameStateRef.current);
    const totalTiles = totalRows * totalCols;
    let tiles = new THREE.InstancedMesh(hexGeometry, tileMaterial, totalTiles);

    // Name the mesh so it's easier to find later in the scene.
    tiles.name = "tiles";
    // Save rows/cols with the InstancedMesh to make it easier to access them
    tiles.totalRows = totalRows;
    tiles.totalCols = totalCols;

    // Set up the board! This means placing and coloring all the tiles.
    makeBoard(tiles, gameStateRef.current);
    scene.add(tiles);

    // Uncomment this to put a test cube in the scene!
    /*let box = new THREE.BoxGeometry(1, 1, 1);
    const cube = new THREE.Mesh(box, m);
    scene.add(cube)
    cube.position.x = 5
    cube.position.y = 5
    cube.position.z = 5
    console.log(cube.matrix) */
  
    // Add some lights!
    const light = new THREE.DirectionalLight(0xffffff, 1)
    const ambientLight = new THREE.AmbientLight(0xffffff, .5)
  
    // Move the light out to a better position
    light.position.x = 5;
    light.position.y = 5;
    light.position.z = 10;
    scene.add(light);
    scene.add(ambientLight)
  
    // Add axis helper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper)
    camera.position.z = 20;
    camera.position.y = 0;
    camera.position.x = 0;
    camera.lookAt(0, 0, 0)
  
    // Set up a raycaster
    const raycaster = new THREE.Raycaster();

    // Set up mouse
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
      setInteractionData(prev => ({
        ...prev,
        pointer
      }))
    }
    window.addEventListener('mousemove', onMouseMove, false);

    let previousHoverId = 'none';

    let animate = function () {
      requestAnimationFrame(animate);
      raycaster.setFromCamera(mouse, camera)
      const currentHover = handleTileHover(raycaster, tiles, previousHoverId);
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
    };
    animate();
    // === THREE.JS CODE END ===
  
  }, [])

  return [interactionData, messageData]
}

const updateBoard = (gameState) => {
  console.log('updated')
  console.log(gameState.players.p1.board.ships)
  return true;
}

const handleTileHover = (raycaster, tiles, prevTileId) => {
  // 1. Load the data for the last tile hovered over.
  let prevTileData = tiles.gameData[prevTileId];
  // 2. Set up conditions.
  // Are we hovering over any tiles?
  const tileIntersections = raycaster.intersectObject(tiles);
  let currentlyHoveredId = 'none'
  if (tileIntersections.length > 0) {
    // Save the instanceID of the tile
    currentlyHoveredId = tileIntersections[0].instanceId;
    const currentTileData = tiles.gameData[currentlyHoveredId]

    // If we're hovering over a new tile...
    if (prevTileId !== currentlyHoveredId) {
      // If the old tile was hoverable, reset its color.
      const tileBaseColor = tiles.gameData[prevTileId].baseColor;
      prevTileData.hoverable && tiles.setColorAt(prevTileId, tileBaseColor);
    }

    // If the current tile is interactable...
    if (currentTileData.hoverable) {
      // Set its color to the hover color.
      const tileHoverColor = tiles.gameData[currentlyHoveredId].hoverColor;
      tiles.setColorAt(currentlyHoveredId, tileHoverColor)
    }
    tiles.instanceColor.needsUpdate = true;
  }
  // 3. If we're not hovering over any tiles, but we were previously
  //    hovering over a hoverable tile...
  else if (prevTileData.hoverable) {
    // Reset its color.
    const tileBaseColor = tiles.gameData[prevTileId].baseColor;
    tiles.setColorAt(prevTileId, tileBaseColor);
    tiles.instanceColor.needsUpdate = true;

    // And update to show that we're not hovering over any tiles.
    currentlyHoveredId = 'none';
  }
  return( { ...tiles.gameData[currentlyHoveredId] })
};

const determineTotalTiles = gameState => {
  console.log(gameState)
  const playersArr = Object.values(gameState.players);
  // Boards are drawn horizontally next to each other, so the
  // number of player rows is just one player's rows.
  // Columns need to be added from all players.
  const playerRows = playersArr[0].board.rows;
  const playerCols = playersArr.map(player => player.board.columns)
                    .reduce((a, b) => a + b);

  // Need one COLUMNS_BETWEEN between each player board.
  const spacerColsNeeded = playersArr.length - 1
  const spacerColsTotal = COLUMNS_BETWEEN * spacerColsNeeded

  const totalRows = playerRows + ROWS_TOP + ROWS_BOTTOM;
  const totalCols = playerCols + spacerColsTotal + COLUMNS_LEFT + COLUMNS_RIGHT;
  return {totalRows, totalCols}
}

const determinePlayerBoardBoundaries = gameState => {
  // Assumes that all boards are placed horizontally next to each other.
  const playersArr = Object.values(gameState.players);
  const playerBoundaries = [];
  let currentX = COLUMNS_LEFT - 1; // Offset by 1 to account for 0-index
  for (let i = 0; i < playersArr.length; i++) {
    const currentPlayer = playersArr[i];
    const id = currentPlayer.id;

    // Move right 1 from where we stopped last. Add spacer columns between boards.
    const startX = 1 + currentX + COLUMNS_BETWEEN * i;
    const startY = ROWS_TOP;

    // Since startX and startY are on the first row/column, subtract 1 to account.
    const endX = startX + currentPlayer.board.columns - 1;
    const endY = startY + currentPlayer.board.rows - 1;
    currentX = endX;
    playerBoundaries.push({ id, startX, startY, endX, endY })
  }

  return playerBoundaries;
}

const makeBoard = (tiles, gameState) => {
  // Dependent on determineTotalTiles() to get the right number of tiles.
  const playerBoundaries = determinePlayerBoardBoundaries(gameState);
  const {totalRows, totalCols} = tiles;

  // Create a property to hold game data about each tile
  tiles.gameData = {
    none: {
      boardPosition: null,
      relativeBoardPosition: null,
      playerId: null,
      instanceId: 'none'
    }
  };

  // Create the base position matrix for the board tiles
  const testMatrix = new THREE.Matrix4();
  // Make a board!
  let tileCounter = 0;
  for (let row = 0; row < totalRows; row++) {
    for (let col = 0; col < totalCols; col++) {
      const params = {
        col,
        row,
        tileRadius: TILE_RADIUS,
        tileHeight: TILE_HEIGHT
      }
      // Find the 3D space positioning for this coordinate and apply it to this tile.
      const [x, y] = boardCoordinatesToSceneCoordinates(params);
      testMatrix.makeTranslation(x, y, TILE_BASE);
      tiles.setMatrixAt(tileCounter, testMatrix);

      // Set tile color and attributes depending on whether it's part of a player board.
      const playerBoardData = tileBoardData(playerBoundaries, [col, row]);
      let boardPosition = null;
      let worldPosition = [col, row]
      let playerId = null;
      let instanceId = tileCounter;
      let hoverable = false;
      let baseColor = tileFillerColor;
      let hoverColor = null;
      // If this is part of a board, set its color to the base color.
      // Otherwise, set it to the "non-interactive" color
      if (playerBoardData) {
        baseColor = boardBaseColor;
        hoverColor = boardHoverColor
        const {startX, startY} = playerBoardData;
        playerId = playerBoardData.id;
        hoverable = true;
        boardPosition = tileRelativePosition(startX, startY, col, row)
      }
      tiles.setColorAt(tileCounter, baseColor);
      tiles.gameData[tileCounter] = {
        worldPosition,
        boardPosition,
        playerId,
        instanceId,
        hoverable,
        baseColor,
        hoverColor
      }
      tileCounter++;
    }
  }
}

// Check all player boards to see if a tile is inside the boundaries of that board.
const tileBoardData = (boundaries, tilePos) => {
  for (let boundaryObj of boundaries) {
    const { id, startX, startY, endX, endY } = boundaryObj;
    const [x, y] = tilePos;
    if (x >= startX && x <= endX && y >= startY && y <= endY) {
      return { id, startX, startY };
    }
  }

  return null;
}


const tileRelativePosition = (startX, startY, tileX, tileY) => {
  return [tileX - startX, tileY - startY]
}