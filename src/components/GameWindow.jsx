import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import '../styles/GameWindow.css'

const  { GameEngine, CONSTANTS } = require('@itspladd/battleship-engine')

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
      {id: 'p1', name: 'Trapezius'},
      {id:'p2', name: 'Tautrion'}
    ];
    setEngine(new GameEngine(players));
    setMoves(CONSTANTS.RULES.DEFAULT_RULES.MOVES);
  }, [])

  useEffect(() => {
    // === THREE.JS CODE START ===
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    var renderer = new THREE.WebGLRenderer({canvas: renderCanvas.current});
    renderer.setSize( window.innerWidth, window.innerHeight );
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    var cube = new THREE.Mesh( geometry, material );
    scene.background = new THREE.Color( 'slateblue' )
    scene.add( cube );
    camera.position.z = 5;
    var animate = function () {
      requestAnimationFrame( animate );
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render( scene, camera );
    };
    animate();
    setRenderer(renderer);
    // === THREE.JS EXAMPLE CODE END ===
  }, [])

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
      <button onClick={handleClick}>{buttonResult}</button>
    </div>
  )
}