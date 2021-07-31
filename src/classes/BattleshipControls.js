import * as THREE from 'three';

import { MapControls } from 'three/examples/jsm/controls/OrbitControls'
import Ship from './Ship';
import Tiles from './Tile';

const { Tile, PlayerBoardTile } = Tiles;
const { MOVES } = require('@itspladd/battleship-engine').CONSTANTS.RULES.DEFAULT_RULES


class BattleshipControls extends MapControls {
  constructor( camera, domElement, setViewerData, setMoveData ) {
    super( camera, domElement );
    this._raycaster = new THREE.Raycaster();
    this.setViewerData = setViewerData;
    this.setMoveData = setMoveData;

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
    this.handleNewHover = this.handleNewHover.bind(this); // Called by a forEach
    this.handleAbandonedHover = this.handleAbandonedHover.bind(this); // Called by a forEach
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

  get playerID() {
    return this._game.ownerID
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

  get placementTarget() {
    return this._placementTargets[0];
  }

  deselect() {
    this.selection.onDeselect();
    this._currentSelected.pop();
  }

  select() {
    //Grab new selection and handle it.
    this.selection = this._potentialSelect;
    this.selection.onSelect();

    // Clear potential selection.
    this._potentialSelect = null;
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

        // If there's something new we could select, then do so.
        if(this._potentialSelect) {
          // Clear old selection and select new.
          this.deselect();
          this.select();
        }
        // If there's nothing to select, but we CAN place the current selection, do so.
        else if(this.canPlace(this.selection)) {
          this.place(this.selection, this.placementTarget)
          this.deselect();
        }
        else {
          // Otherwise, put the ship back.
          this.sendMoveShipMove(this.selection.id, null, 0);
          this.deselect()
        }
      } else {
        if(this._potentialSelect) {
          this.select();
        }
      }


    }
  }

  canPlace(selectable) {
    this._placementTargets = this._currentHovers.filter(hoverable => this.selection.canMoveTo(hoverable))
    return this._placementTargets.length > 0
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
      this.setViewerData(prev => {
        return ({ ...prev, currentHover:null })
      });
    }
    return hovering || prevHovering;
  }

  handleHovers() {
    // If we were already hovering over any items...
    // Find new hovers and abandoned hovers.
    const newHovers = this._currentHovers.filter(currentHoverable => !this._prevHovers.includes(currentHoverable));
    const abandonedHovers = this._prevHovers.filter(prevHoverable => !this._currentHovers.includes(prevHoverable));

    //If any of the hovers are selected, we don't do hover behavior for that entity.
    newHovers.forEach(this.handleNewHover);
    abandonedHovers.forEach(this.handleAbandonedHover);

    const currentHover = this._currentHovers.map(hoverable => hoverable.hoverData)[0]
    this.setViewerData(prev => ({ ...prev, currentHover, newHovers }));
    this._prevHovers = this._currentHovers;
  }

  handleNewHover(hoverable) {
    // If it's not selected, do its onHover action.
    !hoverable.selected && hoverable.onHover();

    const selection = this.selection;

    // If there's a selected ship that can move to this hoverable,
    // move it!
    if(selection && selection.canMoveTo(hoverable)) {
      const playerId = selection.owner.playerId;
      const shipId = selection.id;
      const position = hoverable.boardPosition;
      const angle = selection.angle;
      this.sendMoveShipMove(shipId, position, angle)
    }
  }

  handleAbandonedHover(hoverable) {
    !hoverable.selected && hoverable.onHoverExit()
  }

  place(selection, target) {
    selection.onPlace();
    this.sendPlaceShipMove(selection.id)
  }

  sendMoveShipMove(shipID, position, angle) {
    this.setMoveData({
      moveType: MOVES.MOVE_SHIP.NAME,
      targetPlayerID: this.playerID,
      playerID: this.playerID,
      shipID,
      position,
      angle
    })
  }

  sendPlaceShipMove(shipID) {
    this.setMoveData({
      moveType: MOVES.PLACE_SHIP.NAME,
      targetPlayerID: this.playerID,
      playerID: this.playerID,
      shipID
    })
  }
}

export { BattleshipControls };