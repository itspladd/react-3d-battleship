import * as THREE from 'three';

import { MapControls } from 'three/examples/jsm/controls/OrbitControls'

class BattleshipControls extends MapControls {
  constructor( camera, domElement, setViewerData ) {
    super( camera, domElement );
    this._raycaster = new THREE.Raycaster();
    this.setViewerData = setViewerData;

    this._currentHovers = [];
    this._prevHovers = [];
    this._currentSelected = [];
    this._prevSelected = [];

    this._pointer = this.setupPointer();
    // Put angle limits on the camera movement
    //this.maxAzimuthAngle = 0; //Prevent orbiting if uncommented
    //this.minAzimuthAngle = 0; //Prevent orbiting if uncommented
    this.maxPolarAngle = (3/16) * Math.PI;
    this.minPolarAngle = 0;

    this.onPointerMove = this.onPointerMove.bind(this); // Called by window, so scope changes
    this.onPointerDown = this.onPointerDown.bind(this); // Called by window, so scope changes
    this.onPointerUp = this.onPointerUp.bind(this); // Called by window, so scope changes
    domElement.addEventListener('mousemove', this.onPointerMove, false);
    domElement.addEventListener('pointerdown', this.onPointerDown, false);
    domElement.addEventListener('pointerup', this.onPointerUp, false);
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

  get pointerDelta() {
    return Date.now() - this._pointerDownTime;
  }

  get selection() {
    return this._currentSelected[0];
  }
  
  set selection(obj) {
    this._currentSelected.push(obj)
  }

  deselect() {
    this.selection.onDeselect();
    this._currentSelected.pop();
  }

  handleAnimationLoop() {
    this._raycaster.setFromCamera(this._pointer, this.camera)
    this.detectHovers() && this.handleHovers();
  }

  setupPointer() {
    return new THREE.Vector2(-1, -1);
  }

  onPointerMove(event) {
    //calculate mouse position and save it
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

  onPointerDown(event) {
    event.preventDefault();

    // Save the timestamp for this click to calculate click duration
    this._pointerDownTime = Date.now();

    // Find out what was clicked on
    if(this.game) {
      // Find selectable items that were clicked on
      this._potentialSelect = this._currentHovers
        .filter(hoverable => this.game.selectables.includes(hoverable))
        .pop();
    }
  }

  onPointerUp(event) {
    event.preventDefault();
    
    // If we did a fast click (i.e. not a drag for camera controls)...
    if(this.pointerDelta < 500) {
      // If we already have something selected...
      if(this.selection) {
        this.deselect();
      }

      if(this._potentialSelect) {
        this.selection = this._potentialSelect;
        this.selection.onSelect();
        this._potentialSelect = null;
      }
    }
  }

  // Returns true if there are any current hovers or any previous hovers.
  detectHovers() {
    // Assume no current hover.
    this._currentHovers = [];
    if(this.game) {
      this._currentHovers = this.game.hoverables
        .map(h => h.currentHover(this._raycaster)) // Get hovered objects
        .filter(h => !!h) // Filter out falsy values like undefined or false
    }
    const hovering = this._currentHovers.length > 0;
    const prevHovering = this._prevHovers.length > 0
    if (!hovering) {
      this.setViewerData(prev => ({ ...prev, currentHover: null }));
    }
    return hovering || prevHovering;
  }

  handleHovers() {
    // If we were already hovering over any items...
    // Find new hovers and abandoned hovers.
    const newHovers = this._prevHovers.filter(prevHoverable => this._currentHovers.includes(prevHoverable));
    const abandonedHovers = this._prevHovers.filter(prevHoverable => !this._currentHovers.includes(prevHoverable));

    //If any of the hovers are selected, we don't do hover behavior for that entity.
    newHovers.forEach(hoverable => !hoverable.selected && hoverable.onHover());
    abandonedHovers.forEach(hoverable => !hoverable.selected && hoverable.onHoverExit());

    const currentHover = this._currentHovers.map(hoverable => hoverable.hoverData)[0]
    this.setViewerData(prev => ({ ...prev, currentHover }));
    this._prevHovers = this._currentHovers;
  }
}

export { BattleshipControls };