import { useEffect, useState } from 'react'
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls'

// Helpers
import { boardCoordinatesToSceneCoordinates } from '../helpers/boardHelpers'
import { EdgesGeometry } from 'three';

export default function use3DBoard(canvasRef, gameState) {
  const [renderer, setRenderer] = useState();
  const [mouseData, setMouse] = useState([]);

  useEffect(() => {

    // IMPORTANT CONSTANTS FOR SETTING UP THE HEX TILES
    // Distance from tile center to a given vertex
    const TILE_RADIUS = 1.0;
    // Distance from tile center to center of a given side
    // calculation: R * sin(60 deg. or 2pi/6 rad.)
    const TILE_HEIGHT = TILE_RADIUS * Math.sin(Math.PI / 3);
    // Length of a single tile side
    // Equal to HEX_RADIUS since this is a regular hexagon.
    const TILE_SIDE = TILE_RADIUS;
    const TILE_THICKNESS = 0.25;
    // The height of the center of a tile to get it to lay "flat" on the XY plane
    // (i.e. the back of the tile is at z = 0)
    const TILE_BASE = TILE_THICKNESS / 2;
    const BOARD_ROWS = gameState.players.p1.board.rows;
    const BOARD_COLS = gameState.players.p1.board.columns;
    const TOTAL_TILES = BOARD_ROWS * BOARD_COLS;
  
    // === THREE.JS CODE START ===
    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    let renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    let controls = new MapControls(camera, canvasRef.current)
    controls.screenSpacePanning = true;
  
    // Uncomment this to put angle limist on the camera.
    /* controls.maxAzimuthAngle = 0;
    controls.minAzimuthAngle = 0;
    controls.maxPolarAngle = Math.PI * .8;
    controls.minPolarAngle = Math.PI / 2; */
  
    renderer.setSize(window.innerWidth, window.innerHeight);
  
    // Make and orient the basic hex geometry for all tiles
    const hexGeometry = new THREE.CylinderBufferGeometry(TILE_RADIUS * .95, TILE_RADIUS, TILE_THICKNESS, 6);
    hexGeometry.rotateX(Math.PI * 0.5) // Turn the tile so it's laying "flat"
    hexGeometry.rotateZ(Math.PI * 0.5) // Turn the tile to "point" sideways
    // Make the material for all tiles
    let m = new THREE.MeshStandardMaterial({
      color: 0xffffff, // If the base color is white, we can apply any other color easily!
      roughness: 0.6,
      metalness: 0.5
    });
    let tileColor = new THREE.Color(0x0066ff)
  
    // Create the instanced mesh for all tiles
    let tiles = new THREE.InstancedMesh(hexGeometry, m, TOTAL_TILES);
    scene.add(tiles);
  
    // Create the base position matrix for the board tiles
    const testMatrix = new THREE.Matrix4();
    // Make a board!
    let tileCounter = 0;
    for (let row = 0; row < BOARD_ROWS; row++) {
      for (let col = 0; col < BOARD_COLS; col++) {
        const params = {
          col,
          row,
          tileRadius: TILE_RADIUS,
          tileHeight: TILE_HEIGHT
        }
        const [x, y] = boardCoordinatesToSceneCoordinates(params);
        testMatrix.makeTranslation(x, y, TILE_BASE);
        tiles.setMatrixAt(tileCounter, testMatrix);
        tiles.setColorAt(tileCounter, tileColor)
        tileCounter++;
      }
    }
    testMatrix.makeTranslation(0, 0, TILE_BASE)
  
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
    const mouse = new THREE.Vector2();
    const onMouseMove = (event) => {
      //calculate mouse position
      if(event.button) {
        console.log(event.button)
      }
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
      setMouse([mouse.x, mouse.y, event.clientY, window.innerHeight])
    }
    window.addEventListener('mousemove', onMouseMove, false);
  
    const hoverColor = new THREE.Color(0x4477ff);
    let currentlySelectedTile;
    let animate = function () {
      requestAnimationFrame(animate);
      raycaster.setFromCamera(mouse, camera)
      const tileIntersections = raycaster.intersectObject(tiles);
      if (tileIntersections.length > 0) {
        const instanceId = tileIntersections[0].instanceId;
        if (currentlySelectedTile !== instanceId) {
          tiles.setColorAt(currentlySelectedTile, tileColor);
          currentlySelectedTile = instanceId;
        }
        console.log(`intersected tile ${instanceId}`)
        tiles.setColorAt(instanceId, hoverColor)
        tiles.instanceColor.needsUpdate = true;
      } else if (currentlySelectedTile >= 0) {
        tiles.setColorAt(currentlySelectedTile, tileColor);
        tiles.instanceColor.needsUpdate = true;
        currentlySelectedTile = -1;
      }
      renderer.render(scene, camera);
    };
    animate();
    setRenderer(renderer);
    // === THREE.JS CODE END ===
  
  }, [])

  return [mouseData]
}

