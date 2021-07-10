import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls'

// Helpers
import * as hlpB from '../helpers/boardHelpers'

// Constants
import { TILE_GEOMETRY, MATERIALS, COLORS } from '../constants/3DBOARD';
const { getNeighborsInDirection } = require('@itspladd/battleship-engine').HELPERS.positionHelpers


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

const makeGameBoard = (gameState, thisPlayerId) => {
  const gameBoard = {
    players: {},
    dimensions: hlpB.determineBoardDimensions(gameState),
    tileData: {}
  }
  const tileMatrix = [];
  for (let i = 0; i <= gameBoard.dimensions[1]; i++) {
    tileMatrix.push([])
  }
  gameBoard.tileAt = tileMatrix;
  gameBoard.tileAt[0][0] = 5;

  gameBoard.boundaries = hlpB.determinePlayerBoardBoundaries(gameState, thisPlayerId);



  gameBoard.tiles = makeTiles(gameBoard, thisPlayerId);
  gameBoard.ships = makeShips(gameState, thisPlayerId);

  gameBoard.addAllToScene = scene => {
    scene.add(gameBoard.tiles)
    gameBoard.ships.forEach(ship => scene.add(ship))
  }

  return gameBoard;
}

const makeTiles = (gameBoard, playerId) => {
  // Make and orient the basic hex geometry for all tiles
  const hexGeometry = new THREE.CylinderBufferGeometry(TILE_RADIUS * .95, TILE_RADIUS, TILE_THICKNESS, 6);
  hexGeometry.rotateX(Math.PI * 0.5) // Turn the tile so it's laying "flat"
  hexGeometry.rotateZ(Math.PI * 0.5) // Turn the tile to "point" sideways

  // Calculate the total number of tiles
  const [ totalRows, totalCols ] = gameBoard.dimensions;
  const totalTiles = totalRows * totalCols;

  // Create the instanced mesh for all tiles
  let tiles = new THREE.InstancedMesh(hexGeometry, tileMaterial, totalTiles);

  // Name the mesh so it's easier to find later in the scene.
  tiles.name = "tiles";
  // Save rows/cols with the InstancedMesh to make it easier to access them
  tiles.totalRows = totalRows;
  tiles.totalCols = totalCols;

  // Create a property to hold game data about each tile
  gameBoard.tileData = {
    none: {
      instanceId: 'none',
      boardPosition: null,
      relativeBoardPosition: null,
      playerId: null
    }
  };

  // Make a board!
  let tileCounter = 0;
  for (let row = 0; row < totalRows; row++) {
    for (let col = 0; col < totalCols; col++) {
      // Set the transformation for this tile.
      tiles.setMatrixAt(tileCounter, getMatrixFor([col, row]));

      // Set tile color and attributes depending on whether it's part of a player board.

      let worldPosition = [col, row]
      let [playerId, startX, startY] = hlpB.tileInBoard(gameBoard.boundaries, worldPosition);
      let boardPosition = null;
      let instanceId = tileCounter;
      let hoverable = false;
      let baseColor = tileFillerColor;
      let hoverColor = null;
      // If this is part of a board, set its color to the base color.
      // Otherwise, set it to the "non-interactive" color
      if (playerId !== null) {
        baseColor = boardBaseColor;
        hoverColor = boardHoverColor
        hoverable = true;
        boardPosition = hlpB.tileRelativePosition(startX, startY, col, row)
      }
      tiles.setColorAt(tileCounter, baseColor);
      gameBoard.tileData[tileCounter] = {
        worldPosition,
        boardPosition,
        playerId,
        instanceId,
        hoverable,
        baseColor,
        hoverColor
      }
      gameBoard.tileAt[col][row] = instanceId;
      tileCounter++;
    }
  }

  return tiles;
}

const makeShips = (gameState, thisPlayerId) => {
  // Set up some variables for ships!
  const segmentLength = TILE_HEIGHT * 2;
  const segmentGeom = new THREE.BoxGeometry( 1, segmentLength, 1)
  const material = new THREE.MeshBasicMaterial( {color: 0x666666} );
  const ships = [];
  let nullX = 4;
  let nullY = 3;
  const player = gameState.players[thisPlayerId]
  console.log(player.board.ships)
  for (let shipId in player.board.ships) {

    // Set up convenience variables.
    const shipData = player.board.ships[shipId]
    const numSegments = shipData.segments.length
    const nullStart = [nullX, nullY];

    // Set up data about this specific ship.
    const ship = new THREE.Group();
    ship.name = thisPlayerId + shipId;
    ship.nullAngle = 0;
    ship.nullPositions = getNeighborsInDirection(nullStart, ship.nullAngle, numSegments)

    //Make and add segments.
    for(let i = 0; i < shipData.segments.length; i++) {
      const segment = makeShipSegment(segmentGeom, material);
      positionObject(segment, ship.nullPositions[i], ship.nullAngle);
      ship.add(segment);
    }

    // Add ship to list.
    ships.push(ship)
    // Increment null location.
    nullX++;
  }
  return ships;
}

const makeShipSegment = (geom, mat) => {
  return new THREE.Mesh(geom, mat);
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

const positionObject = (obj, position, rotation) => {
  placeObjectAt(obj, position);
  setRotation(obj, rotation);
}

const placeObjectAt = (threeObj, vector2) => {
  const matrix = getMatrixFor(vector2);
  threeObj.applyMatrix4(matrix);
}

// Rotation amount should be in degrees.
const setRotation = (threeObj, degrees) => {
  // Rotation begins in the opposite direction you expect, so we flip the amount.
  degrees = -1 * (degrees - 360)
  const rad = (degrees / 360) * 2 * Math.PI

  threeObj.rotateZ(rad)
}

// Gets the Matrix4 corresponding to the input X and Y
const getMatrixFor = vector2 => {
  const [col, row] = vector2;
  const [sceneX, sceneY] = hlpB.boardCoordinatesToSceneCoordinates({ col, row })
  const matrix = new THREE.Matrix4();
  matrix.makeTranslation(sceneX, sceneY, TILE_BASE);
  return matrix;
}

const handleTileHover = (raycaster, gameBoard, prevTileId) => {
  // 1. Load the data for the last tile hovered over.
  let { tiles } = gameBoard;
  let prevTileData = gameBoard.tileData[prevTileId];
  // 2. Set up conditions.
  // Are we hovering over any tiles?
  const tileIntersections = raycaster.intersectObject(tiles);
  let currentlyHoveredId = 'none'
  if (tileIntersections.length > 0) {
    // Save the instanceID of the tile
    currentlyHoveredId = tileIntersections[0].instanceId;
    const currentTileData = gameBoard.tileData[currentlyHoveredId]

    // If we're hovering over a new tile...
    if (prevTileId !== currentlyHoveredId) {
      // If the old tile was hoverable, reset its color.
      const tileBaseColor = gameBoard.tileData[prevTileId].baseColor;
      prevTileData.hoverable && tiles.setColorAt(prevTileId, tileBaseColor);
    }

    // If the current tile is interactable...
    if (currentTileData.hoverable) {
      // Set its color to the hover color.
      const tileHoverColor = gameBoard.tileData[currentlyHoveredId].hoverColor;
      tiles.setColorAt(currentlyHoveredId, tileHoverColor)
    }
    tiles.instanceColor.needsUpdate = true;
  }
  // 3. If we're not hovering over any tiles, but we were previously
  //    hovering over a hoverable tile...
  else if (prevTileData.hoverable) {
    // Reset its color.
    const tileBaseColor = gameBoard.tileData[prevTileId].baseColor;
    tiles.setColorAt(prevTileId, tileBaseColor);
    tiles.instanceColor.needsUpdate = true;

    // And update to show that we're not hovering over any tiles.
    currentlyHoveredId = 'none';
  }
  return( { ...gameBoard.tileData[currentlyHoveredId] })
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