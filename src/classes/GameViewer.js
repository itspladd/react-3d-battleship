import * as THREE from 'three';
import { BattleshipControls } from './BattleshipControls'
import Game from './Game';

class GameViewer {
  constructor(window, canvasRef, setViewerData, messageDataRef, setMoveData) {
    this._canvasRef = canvasRef;
    this._setViewerData = setViewerData;
    this._messageDataRef = messageDataRef;

    this._scene = new THREE.Scene();
    this._renderer = new THREE.WebGLRenderer({ canvas: this._canvasRef.current });
    this._camera = this.setupCamera();
    this._controls = this.setupControls(setMoveData);


    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._lights = this.setupLights();
    this._axes = this.makeAxes();




    // Add initial stuff to scene
    this.addArr(this._lights);
    this.add(this._axes);

    // Binding functions that get called in odd scopes
    this.animate = this.animate.bind(this); // Recursive, so scope changes if unbound
  }

  get controls() {
    return this._controls;
  }

  get update() {
    return this._messageDataRef.current.update;
  }

  get game() {
    return this._currentGame;
  }

  set update(flag) {
    this._messageDataRef.current.update = false;
  }

  add(object) {
    this._scene.add(object);
  }

  addArr(objects) {
    for (let object of objects) {
      this.add(object)
    }
  }

  setupCamera() {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.up = new THREE.Vector3(0, 0, 1)
    camera.position.z = 20;
    camera.position.y = 0;
    camera.position.x = 0;
    camera.lookAt(0, 0, 0)

    return camera;
  }

  setupControls(setMoveData) {
    const controls = new BattleshipControls(this._camera, this._canvasRef.current, this._setViewerData, setMoveData)

    return controls
  }



  initGame(gameStateRef, ownerId) {
    const game = new Game(gameStateRef, ownerId);
    this._currentGame = game;
    this.controls.game = game;
    this.addGameToScene(game, ownerId)
  }

  addGameToScene(game, playerId) {
    // Add filler tiles
    this.add(game.fillerTiles)

    // For every player:
    Object.values(game.players).forEach(player => {
      // Add the tilemesh for the board to the scene
      this.add(player.board.tileMesh)

      // If the player we're looking at matches the player viewing the board,
      // add their ship meshes to the scene
      player.id === playerId && this.addArr(player.board.shipMeshes)
    });
  }

  setupLights() {
    // Add some lights!
    const light = new THREE.DirectionalLight(0xffffff, 1)
    const ambientLight = new THREE.AmbientLight(0xffffff, .5)

    // Move the light out to a better position
    light.position.x = 5;
    light.position.y = 5;
    light.position.z = 10;

    this.add(light);
    this.add(ambientLight);
    return [light, ambientLight];
  }

  makeAxes() {
    //Add colored XYZ axes for dev purposes.
    return new THREE.AxesHelper(5);
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.controls.handleAnimationLoop();

    // If the board needs to be updated, update the board.
    //TODO: FILL IN
    //
    if(this.update) {
      this._currentGame.update()
      this.update = false;
    }

    this._renderer.render(this._scene, this._camera);
  }

  // Create a simple green cube for dev/test purposes.
  makeTestCube() {
    const box = new THREE.BoxGeometry(1, 1, 1);
    const m = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const cube = new THREE.Mesh(box, m);
    cube.position.x = 5
    cube.position.y = 5
    cube.position.z = 5
    return cube;
  }
}

export default GameViewer;