import { useEffect, useState } from 'react'
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
const tileBaseColor = new THREE.Color(COLORS.TILE_BASE_COLOR);
const tileHoverColor = new THREE.Color(COLORS.TILE_HOVER_COLOR);
const tileFillerColor = new THREE.Color(COLORS.TILE_NONINTERACTIVE_COLOR)

// Set up materials
// Make the material for all tiles
let tileMaterial = new THREE.MeshStandardMaterial({
  ...MATERIALS.TILE_MATERIAL
});

// Check all player boards to see if a tile is inside the boundaries of that board.
const tilePlayerId = (boundaries, tilePos) => {
  for (let boundaryObj of boundaries) {
    const { id, startX, startY, endX, endY } = boundaryObj;
    const [x, y] = tilePos;
    if (x >= startX && x <= endX && y >= startY && y <= endY) {
      return id;
    }
  }

  return null;
}

export default function use3DBoard(canvasRef, gameState) {
  const [renderer, setRenderer] = useState();
  const [mouseData, setMouse] = useState([]);
  const [currentTilePosition, setCurrentTilePosition] = useState([]);

  useEffect(() => {
    // === THREE.JS CODE START ===
    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    let renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    let controls = new MapControls(camera, canvasRef.current)
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
    const { totalRows, totalCols } = determineTotalTiles(gameState);
    const totalTiles = totalRows * totalCols;
    let tiles = new THREE.InstancedMesh(hexGeometry, tileMaterial, totalTiles);

    // Name the mesh so it's easier to find later in the scene.
    tiles.name = "tiles";
    // Save rows/cols with the InstancedMesh to make it easier to access them
    tiles.totalRows = totalRows;
    tiles.totalCols = totalCols;
    makeBoard(tiles, gameState);
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
    const mouse = new THREE.Vector2(-1, -1);
    const onMouseMove = (event) => {
      //calculate mouse position
      if(event.button) {
        console.log(event.button)
      }
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
      setMouse([mouse.x, mouse.y])
    }
    window.addEventListener('mousemove', onMouseMove, false);
  
    let currentlySelectedTile = 'none';
    let animate = function () {
      requestAnimationFrame(animate);
      raycaster.setFromCamera(mouse, camera)
      const tileIntersections = raycaster.intersectObject(tiles);
      if (tileIntersections.length > 0) {
        const instanceId = tileIntersections[0].instanceId;
        if (currentlySelectedTile !== instanceId) {
          tiles.setColorAt(currentlySelectedTile, tileBaseColor);
          currentlySelectedTile = instanceId;
        }
        tiles.setColorAt(instanceId, tileHoverColor)
        tiles.instanceColor.needsUpdate = true;
      } else if (currentlySelectedTile >= 0) {
        tiles.setColorAt(currentlySelectedTile, tileBaseColor);
        tiles.instanceColor.needsUpdate = true;
        currentlySelectedTile = 'none';
      }
      setCurrentTilePosition(tiles.gameData[currentlySelectedTile].boardPosition)
      renderer.render(scene, camera);
    };
    animate();
    setRenderer(renderer);
    console.log(scene)
    // === THREE.JS CODE END ===
  
  }, [])

  return [mouseData, currentTilePosition]
}

const determineTotalTiles = gameState => {
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
  console.log(playerBoundaries)
  const {totalRows, totalCols} = tiles;

  // Create a property to hold game data about each tile
  tiles.gameData = {
    none: {
      boardPosition: null
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
      const playerId = tilePlayerId(playerBoundaries, [col, row]);
      tiles.setColorAt(tileCounter, (playerId ? tileBaseColor : tileFillerColor));
      tiles.gameData[tileCounter] = {
        boardPosition: [col, row]
      }
      tileCounter++;
    }
  }
  tiles.gameData['none'] = {
    boardPosition: null
  }
}