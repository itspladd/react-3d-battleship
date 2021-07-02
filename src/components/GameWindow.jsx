import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls'
import '../styles/GameWindow.css'

const { GameEngine, CONSTANTS } = require('@itspladd/battleship-engine')

export default function GameWindow() {
  // This ref will hold the DOM <canvas> element where we render the game.
  const renderCanvas = useRef(null);

  const [engine, setEngine] = useState();
  const [gameState, setGameState] = useState({});
  const [renderer, setRenderer] = useState();
  const [moves, setMoves] = useState();
  let buttonResult = "Click me";

  useEffect(() => {
    const players = [
      { id: 'p1', name: 'Trapezius' },
      { id: 'p2', name: 'Tautrion' }
    ];
    const initEngine = new GameEngine(players)
    setEngine(initEngine);
    setMoves(CONSTANTS.RULES.DEFAULT_RULES.MOVES);
    setGameState(initEngine.gameState)

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

    // === THREE.JS CODE START ===
    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    let renderer = new THREE.WebGLRenderer({ canvas: renderCanvas.current });
    let controls = new MapControls(camera, renderCanvas.current)
    controls.screenSpacePanning = true;
    controls.maxAzimuthAngle = 0;
    controls.minAzimuthAngle = 0;
    controls.maxPolarAngle = Math.PI * .8;
    controls.minPolarAngle = Math.PI / 2;

    renderer.setSize(window.innerWidth, window.innerHeight);

    // Make and orient the basic hex geometry for all tiles
    let hexGeometry = new THREE.CylinderBufferGeometry(1.5, 1.5, 0.25, 6);
    hexGeometry.rotateX(Math.PI * 0.5) // Turn the tile so it's laying "flat"
    hexGeometry.rotateZ(Math.PI * 0.5) // Turn the tile to "point" sideways

    // Make the material for all tiles
    let m = new THREE.MeshStandardMaterial({
      color: 0x0066ff,
      roughness: 0.75,
      metalness: 0.25
    });

    // Create the instanced mesh for all tiles
    let instanceCount = 100;
    let tiles = new THREE.InstancedMesh(hexGeometry, m, instanceCount);
    scene.add(tiles);

    const testMatrix = new THREE.Matrix4();
    testMatrix.makeTranslation(0, 0, (TILE_THICKNESS / 2))

    tiles.setMatrixAt(0, testMatrix)

    // Make some cubes! For testing!
    let box = new THREE.BoxGeometry(1, 1, 1);
    const cube = new THREE.Mesh(box, m);
    scene.add(cube)
    cube.position.x = 5
    cube.position.y = 5
    cube.position.z = 5
    console.log(cube.matrix)
    // Add some lights
    const light = new THREE.DirectionalLight(0xffffff, 1)
    const ambientLight = new THREE.AmbientLight( 0xffffff, .5)
    // Move the light out to a better position
    light.position.x = 0;
    light.position.y = 0;
    light.position.z = 10;
    scene.add(light);
    scene.add(ambientLight)

    // Add axis helper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper)
    camera.position.z = 20;
    camera.position.y = 0;
    camera.position.x = 0;
    let animate = function () {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
    setRenderer(renderer);
    // === THREE.JS CODE END ===

  }, [])

  const placeTiles = () => {

  }



  const makeHexTile = (radius) => {
    radius = radius || 1;
    const points = [];
    const angleIncrement = (2 * Math.PI) / 6;
    // Calculate hex points
    for (let i = 1; i <= 6; i++) {
      const angle = angleIncrement * i;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      points.push(new THREE.Vector2(x, y));
    }
    console.log(points)
    const hexShape = new THREE.Shape(points);
    const extrudeSettings = {
      steps: 1,
      depth: 0.5,
      bevelEnabled: false,
      bevelThickness: 1,
      bevelSize: 1,
      bevelOffset: 0,
      bevelSegments: 1
    };
    const geometry = new THREE.ExtrudeGeometry(hexShape, extrudeSettings);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    return new THREE.Mesh(geometry, material);
  }

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
      <p>Game window</p>
      {/* Assign the renderCanvas ref to this canvas element! */}
      <canvas ref={renderCanvas} />
      <p>{gameState && JSON.stringify(gameState)}</p>
      <button onClick={() => makeHexTile()}>{buttonResult}</button>
    </div>
  )
}