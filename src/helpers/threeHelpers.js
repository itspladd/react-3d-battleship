import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls'

// Helpers
import * as hlpB from '../helpers/boardHelpers'

// Constants
import { TILE_GEOMETRY, MATERIALS, COLORS } from '../constants/3DBOARD';


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

const setupScene = (window, canvas) => {
  // Create basic three.js stuff
  let scene, camera, renderer, controls, raycaster;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ canvas });
  raycaster = new THREE.Raycaster();
  controls = new MapControls(camera, canvas)

  // Set up initial values
  controls.screenSpacePanning = true;
  renderer.setSize(window.innerWidth, window.innerHeight);

  return [scene, camera, renderer, controls, raycaster];
}

const positionCamera = camera => {
  camera.position.z = 20;
  camera.position.y = 0;
  camera.position.x = 0;
  camera.lookAt(0, 0, 0)
}

const limitCameraMovement = controls => {
  // Uncomment this to put angle limits on the camera.
  controls.maxAzimuthAngle = 0;
  controls.minAzimuthAngle = 0;
  controls.maxPolarAngle = Math.PI * .8;
  controls.minPolarAngle = Math.PI / 2;
}

const makeShips = (gameState) => {
  // Set up some variables for ships!
  const segmentLength = TILE_HEIGHT * 2;


  // Start by making just one ship!
  const segmentGeom = new THREE.BoxGeometry( 1, TILE_HEIGHT * 2, 1)
  const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
  const segment1 = new THREE.Mesh( segmentGeom, material )
  const segment2 = new THREE.Mesh( segmentGeom, material )
  //const segment1Pos = hlpB.boardCoordinatesToSceneCoordinates()
  segment1.position.set(0,0,0)
  segment2.position.set(0,2,0)
  return [segment1, segment2]
}

const makeTiles = (gameState, playerId) => {
  // Make and orient the basic hex geometry for all tiles
  const hexGeometry = new THREE.CylinderBufferGeometry(TILE_RADIUS * .95, TILE_RADIUS, TILE_THICKNESS, 6);
  hexGeometry.rotateX(Math.PI * 0.5) // Turn the tile so it's laying "flat"
  hexGeometry.rotateZ(Math.PI * 0.5) // Turn the tile to "point" sideways

  // Determine the total number of tiles on the field (boards + filler)
  const { totalRows, totalCols } = hlpB.determineTotalTiles(gameState);
  const totalTiles = totalRows * totalCols;

  // Create the instanced mesh for all tiles
  let tiles = new THREE.InstancedMesh(hexGeometry, tileMaterial, totalTiles);

  // Name the mesh so it's easier to find later in the scene.
  tiles.name = "tiles";
  // Save rows/cols with the InstancedMesh to make it easier to access them
  tiles.totalRows = totalRows;
  tiles.totalCols = totalCols;

  const playerBoundaries = hlpB.determinePlayerBoardBoundaries(gameState, playerId);

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
      const [x, y] = hlpB.boardCoordinatesToSceneCoordinates(params);
      testMatrix.makeTranslation(x, y, TILE_BASE);
      tiles.setMatrixAt(tileCounter, testMatrix);

      // Set tile color and attributes depending on whether it's part of a player board.
      const playerBoardData = hlpB.tileBoardData(playerBoundaries, [col, row]);
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
        boardPosition = hlpB.tileRelativePosition(startX, startY, col, row)
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

  return tiles;
}

const makeGameBoard = (gameState, thisPlayerId) => {
  const gameBoard = {
    players: {}
  }
  gameBoard.tiles = makeTiles(gameState, thisPlayerId);
  gameBoard.ships = makeShips(gameState);
  return gameBoard;
}

const makeLights = () => {
  // Add some lights!
  const light = new THREE.DirectionalLight(0xffffff, 1)
  const ambientLight = new THREE.AmbientLight(0xffffff, .5)

  // Move the light out to a better position
  light.position.x = 5;
  light.position.y = 5;
  light.position.z = 10;

  return [light, ambientLight];
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

// Create a simple green cube for dev/test purposes.
const makeTestCube = () => {
  const box = new THREE.BoxGeometry(1, 1, 1);
  const m = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  const cube = new THREE.Mesh(box, m);
  cube.position.x = 5
  cube.position.y = 5
  cube.position.z = 5
  return cube;
}

// Set up the colored axes for dev purposes.
const makeAxesHelpers = () => {
  return new THREE.AxesHelper(5);
}

const hlp3 = {
  makeGameBoard,
  setupScene,
  positionCamera,
  limitCameraMovement,
  makeShips,
  makeTiles,
  makeLights,
  handleTileHover,
  makeTestCube,
  makeAxesHelpers
}

export { hlp3 };