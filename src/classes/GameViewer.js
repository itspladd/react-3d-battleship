import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls'
import Game from './Game';

class GameViewer {
  constructor(window, canvasRef, setViewerData) {
    this._canvasRef = canvasRef;
    this._setViewerData = setViewerData;

    this._scene = new THREE.Scene();
    this._renderer = new THREE.WebGLRenderer({ canvas: this._canvasRef.current });
    this._raycaster = new THREE.Raycaster();
    this._camera = this.setupCamera();
    this._controls = this.setupControls();


    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._lights = this.setupLights();
    this._axes = this.makeAxes();
    this._pointer = this.setupPointer();

    this._currentHovers = [];
    this._prevHovers = [];


    // Add initial stuff to scene
    this.add(this._lights);
    this.add(this._axes);

    // Binding functions that get called in odd scopes
    this.animate = this.animate.bind(this); // Recursive, so scope changes if unbound
    this.onPointerMove = this.onPointerMove.bind(this); // Called by window, so scope changes
  }

  add(object) {
    this._scene.add(object);
  }

  setupCamera() {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;
    camera.position.y = 0;
    camera.position.x = 0;
    camera.lookAt(0, 0, 0)

    return camera;
  }

  setupControls() {
    const controls = new MapControls(this._camera, this._canvasRef.current)
    controls.screenSpacePanning = true;

    // Put angle limits on the camera movement
    controls.maxAzimuthAngle = 0;
    controls.minAzimuthAngle = 0;
    controls.maxPolarAngle = Math.PI * .8;
    controls.minPolarAngle = Math.PI / 2;

    return controls
  }

  setupPointer() {
    return new THREE.Vector2(-1, -1);
  }

  initGame(gameState, ownerId) {
    this._currentGame = new Game(gameState, ownerId);
    this.addGameToScene(this._currentGame)
  }

  addGameToScene(game) {
    // Add filler tiles
    this.add(game.fillerTiles)
    // Add player boards
    Object.values(game.players).forEach(player => {
      const tileMesh = player.board.tileMesh;
      const testMatrix = new THREE.Matrix4();
      tileMesh.getMatrixAt(2, testMatrix)
      console.log(testMatrix)
      this.add(player.board.tileMesh)
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

  onPointerMove(event) {
    //calculate mouse position
    this._pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this._pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    const pointer = {
      normalizedPosition: [this._pointer.x, this._pointer.y],
      rawPosition: [event.clientX, event.clientY]
    }
    const cam = {
      position: this._camera.position,
      rotation: this._camera.quaternion
    }
    this._setViewerData(prev => ({
      ...prev,
      pointer,
      camera: cam
    }))
  }

  animate() {
    requestAnimationFrame(this.animate);
    this._raycaster.setFromCamera(this._pointer, this._camera)
    this.detectHover();
    this._renderer.render(this._scene, this._camera);
  }

  detectHover() {
    // Assum no current hover.
    this._currentHovers = [];
    if(this._currentGame) {
      // TODO: Detect ships
      Object.values(this._currentGame.players).forEach(player => {
        const boardIntersections = this._raycaster.intersectObject(player.board.tileMesh);
        if (boardIntersections.length > 0) {
          const tile = boardIntersections[0];

          // Add tile object to current hover list
          this._currentHovers.push(player.board.tiles[tile.instanceId])
        }
      })
    }

    // If we were already hovering over any items...

    const newHovers = this._prevHovers.filter(prevHoverable => this._currentHovers.includes(prevHoverable));
    const abandonedHovers = this._prevHovers.filter(prevHoverable => !this._currentHovers.includes(prevHoverable));

    newHovers.forEach(hoverable => hoverable.onHover());
    abandonedHovers.forEach(hoverable => hoverable.onHoverExit());

    this._prevHovers = this._currentHovers;
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