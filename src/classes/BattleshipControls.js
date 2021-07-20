import * as THREE from 'three';

import { MapControls } from 'three/examples/jsm/controls/OrbitControls'

class BattleshipControls extends MapControls {
  constructor( camera, domElement, setViewerData ) {
    super( camera, domElement );
    this._raycaster = new THREE.Raycaster();
    this.setViewerData = setViewerData;

    this._currentHovers = [];
    this._prevHovers = [];

    this._pointer = this.setupPointer();
    // Put angle limits on the camera movement
    //this.maxAzimuthAngle = 0; //Prevent orbiting if uncommented
    //this.minAzimuthAngle = 0; //Prevent orbiting if uncommented
    this.maxPolarAngle = (3/16) * Math.PI;
    this.minPolarAngle = 0;

    this.onPointerMove = this.onPointerMove.bind(this); // Called by window, so scope changes
    domElement.addEventListener('mousemove', this.onPointerMove, false);
  }

  get camera() {
    return this.object
  }

  set game(gameObj) {
    this._game = gameObj;
  }

  get game() {
    return this._game;
  }

  handleAnimationLoop() {
    this._raycaster.setFromCamera(this._pointer, this.camera)
    this.detectHovers() && this.handleHovers();
  }

  setupPointer() {
    return new THREE.Vector2(-1, -1);
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
      position: this.camera.position,
      rotation: this.camera.quaternion
    }
    this.setViewerData(prev => ({
      ...prev,
      pointer,
      camera: cam
    }))

  }

  // Returns true if there are any current hovers or any previous hovers.
  detectHovers() {
    // Assume no current hover.

    this._currentHovers = [];
/*     if(this._currentGame) {
      const players = Object.values(this._currentGame.players)

      // TODO: Detect ships
      this._currentHovers = this._currentGame.players.p2.board.shipsArr.filter(ship => ship.currentlyHovered(this._raycaster))
      // Detect tiles
      players.forEach(player => {
        const boardIntersections = this._raycaster.intersectObject(player.board.tileMesh);
        if (boardIntersections.length > 0) {
          const tile = boardIntersections[0];

          // Add tile object to current hover list
          this._currentHovers.push(player.board.tiles[tile.instanceId])
        }
      })
    } */
    if(this.game) {
      this._currentHovers = this.game.hoverables.map(h => h.currentHover(this._raycaster))
      console.log(this._currentHovers)
      this._currentHovers = this._currentHovers.filter(h => !!h)
      console.log(this._currentHovers)
    }
    const hovering = this._currentHovers.length > 0;
    if (!hovering) {
      this.setViewerData(prev => ({ ...prev, currentHover: null }));
    }
    return this._currentHovers.length > 0 || this._prevHovers.length > 0;
  }

  handleHovers() {
    // If we were already hovering over any items...
    // Find new hovers and abandoned hovers.
    const newHovers = this._prevHovers.filter(prevHoverable => this._currentHovers.includes(prevHoverable));
    const abandonedHovers = this._prevHovers.filter(prevHoverable => !this._currentHovers.includes(prevHoverable));
    console.log(newHovers)
    newHovers.forEach(hoverable => hoverable.onHover());
    abandonedHovers.forEach(hoverable => hoverable.onHoverExit());

    const currentHover = this._currentHovers.map(hoverable => hoverable.hoverData)[0]
    this.setViewerData(prev => ({ ...prev, currentHover }));
    this._prevHovers = this._currentHovers;
  }
}

export { BattleshipControls };