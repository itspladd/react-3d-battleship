import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls'
import Game from './Game';

class GameViewer {
  constructor(window, canvasRef, setViewerData) {
    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this._renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    this._raycaster = new THREE.Raycaster();
    this._controls = new MapControls(this._camera, canvasRef.current)

    this.setViewerData = setViewerData;

    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._lights = this.makeLights();
    this._axes = this.makeAxes();
    this._pointer = this.setupPointer();

    this.setupCamera();
    this.setupControls();

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
    this._camera.position.z = 20;
    this._camera.position.y = 0;
    this._camera.position.x = 0;
    this._camera.lookAt(0, 0, 0)
  }

  setupControls() {
    this._controls.screenSpacePanning = true;

    // Put angle limits on the camera movement
    this._controls.maxAzimuthAngle = 0;
    this._controls.minAzimuthAngle = 0;
    this._controls.maxPolarAngle = Math.PI * .8;
    this._controls.minPolarAngle = Math.PI / 2;
  }

  setupPointer() {
    return new THREE.Vector2(-1, -1);
  }

  initGame(gameState, ownerId) {
    this._currentGame = new Game(gameState, ownerId);
  }

  addAllToScene(game) {

  }

  makeLights() {
    // Add some lights!
    const light = new THREE.DirectionalLight(0xffffff, 1)
    const ambientLight = new THREE.AmbientLight(0xffffff, .5)

    // Move the light out to a better position
    light.position.x = 5;
    light.position.y = 5;
    light.position.z = 10;

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
    this.setViewerData(prev => ({
      ...prev,
      pointer,
      camera: cam
    }))
  }

  animate() {
    requestAnimationFrame(this.animate);
    this._raycaster.setFromCamera(this._pointer, this._camera)

    this._renderer.render(this._scene, this._camera);
  }
}

export default GameViewer;