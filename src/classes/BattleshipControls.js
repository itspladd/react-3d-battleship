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
    this._placementTargets = [];
    this.mainHover = null;

    this.enableHovering = true;
    this.enableSelection = true;

    this._pointer = this.setupPointer();
    // Put angle limits on the camera movement
    //this.maxAzimuthAngle = 0; //Prevent orbiting if uncommented
    //this.minAzimuthAngle = 0; //Prevent orbiting if uncommented
    this.maxPolarAngle = (3/16) * Math.PI;
    this.minPolarAngle = 0;

    this.onPointerMove = this.onPointerMove.bind(this); // Called by window, so scope changes
    this.onPointerDown = this.onPointerDown.bind(this); // Called by window, so scope changes
    this.onPointerUp = this.onPointerUp.bind(this); // Called by window, so scope changes
    this.onWheel = this.onWheel.bind(this); // Called by window, so scope changes
    this.handleNewHover = this.handleNewHover.bind(this); // Called by a forEach
    this.handleAbandonedHover = this.handleAbandonedHover.bind(this); // Called by a forEach
    domElement.addEventListener('mousemove', this.onPointerMove, false);
    domElement.addEventListener('pointerdown', this.onPointerDown, false);
    domElement.addEventListener('pointerup', this.onPointerUp, false);
    domElement.addEventListener('wheel', this.onWheel, false);
  }

  get camera() {
    return this.object
  }

  set game(gameObj) {
    this._game = gameObj;
  }

  get game() {
    return this._game; // _game is the 3D stuff defined in this repo.
  }

  get engine() {
    return this._engine; // _engine is the game engine that doesn't know about 3D.
  }

  set engine(engineObj) {
    this._engine = engineObj;
  }

  get gamePlayer() {
    return this.game.players[this.playerID];
  }

  get gameBoard() {
    return this.gamePlayer.board;
  }

  get enginePlayer() {
    return this.engine.players[this.playerID];
  }

  get engineBoard() {
    return this.enginePlayer.board;
  }

  get engineShip() {
    return this.selection ? this.engineBoard.ships[this.selection.id] : null;
  }

  get playerID() {
    return this._game.ownerID
  }

  get pointerDelta() {
    return Date.now() - this._pointerDownTime;
  }

  get dragging() {
    return this.pointerDown && (this.pointerDelta > 500)
  }

  get selection() {
    return this._currentSelected[0] || null;
  }

  set selection(obj) {
    this._currentSelected.push(obj)
  }

  get placementTarget() {
    return this._placementTargets[0] || null;
  }

  get myBoardHovers() {
    const hoveredBoardTiles = this._currentHovers.filter(hoverable => hoverable instanceof PlayerBoardTile)
    const myBoardTiles = hoveredBoardTiles.filter(tile => tile.playerId === this.playerID)
    return myBoardTiles;
  }

  get newMainHover() {
    return this.mainHover && 
           this.prevMainHover &&
           this.mainHover !== this.prevMainHover
  }

  get debugData() {
    return {
      hovers: this._currentHovers,
      selection: this.selection,
      placementTarget: this.placementTarget && this.placementTarget.constructor

    }
  }

  initGame(game, ownerID, engine) {
    this.game = game;
    this.engine = engine;
  }

  deselect() {
    this.selection.onDeselect();
    this._currentSelected.pop();

    //Re-enable zoom.
    this.enableZoom = true;
  }

  select() {
    //Grab new selection and handle it.
    this.selection = this._potentialSelect;
    if (this.selection.placed) {
      this.selection.placed = false;
      this.sendUnplaceShipMove(this.selection.id)
    }
    this.selection.onSelect();

    // Turn off camera zoom so we can rotate the object.
    this.enableZoom = false;

    // Clear potential selection.
    this._potentialSelect = null;
  }

  handleAnimationLoop() {
    this._raycaster.setFromCamera(this._pointer, this.camera)
    this.detectHovers() && this.handleHovers() && this.updateData();
  }

  updateData() {
    // Only use in case of bugs.
    //this.setViewerData(prev => ({...prev, controls: this.debugData}));
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
    this.pointerDown = true;

    // Find out what was clicked on
    if(this.game) {
      // Find selectable items that were clicked on
      this._potentialSelect = this._currentHovers
        .filter(hoverable => this.game.selectables.includes(hoverable))
        .pop();
      // If the user might have clicked on something, disable panning briefly.
      if(this._potentialSelect) {
        this.enablePan = false;
        setTimeout(() => this.enablePan = true, 100)
      }
    }
  }

  onPointerUp(event) {
    event.preventDefault();

    // If we're not dragging...
    if(!this.dragging) {
      // If we already have something selected...
      if(this.selection) {

        // If we can place the current selection, do so.
        if(this.canPlace(this.selection)) {
          console.log('placing current selection')
          this.place(this.selection, this.placementTarget)
          this.deselect();
        }
        // If there's something new we could select, then do so.
        else if(this._potentialSelect) {
          console.log('selecting new item')
          // Clear old selection and select new.
          this.deselect();
          this.select();
        }
        // If we're not hovering over our board, put the ship back.
        else if (!this.myBoardHovers.length > 0) {
          console.log('putting down current item')
          this.sendMoveShipMove(this.selection.id, null, 0);
          this.deselect()
        }
      } else {
        if(this._potentialSelect) {
          this.select();
        }
      }
    }

    this.pointerDown = false;
  }

  onWheel(event) {
    event.preventDefault();

    // If we have anything picked up, rotate it.
    if (this.selection) {
      // Save the selection as "obj" for ease of use later
      const obj = this.selection;

      // Determine direction of rotation
      const angleDelta = event.deltaY > 0 ? 60 : -60;

      // Determine position and angle to send to the engine
      const position = obj.atNull ? [obj.nullX, obj.nullY] : obj.enginePosition
      let angle = obj.angle + angleDelta;
      if(angle === 360) {
        angle = 0;
      } else if(angle === -60) {
        angle = 300;
      }
      this.sendMoveShipMove(obj.id, position, angle)
    }
  }

  canPlace(selectable) {
    // Find the ship in the engine
    const ship = this.engineBoard.ships[selectable.id]

    // Find potential targets to place
    this._placementTargets = this._currentHovers.filter(hoverable => selectable.canMoveTo(hoverable))

    // Do validation from the engine board
    return this._placementTargets.length > 0 &&
           ship.position !== null &&
           this.engineBoard.validShipLocation(ship)
  }

  // Returns true if there are any current hovers or any previous hovers.
  detectHovers() {
    // Assume no current hover.
    this._currentHovers = [];

    // If we have a game and hovering is enabled, find hoverables.
    if(this.game && !this.dragging) {
      this._currentHovers = this.game.hoverables
        .map(h => h.currentHover(this._raycaster)) // Get hovered objects
        .filter(h => !!h) // Filter out falsy values like undefined or false
      this.prevMainHover = this.mainHover;
      this.mainHover = this.myBoardHovers[0];
    }

    // If we have a selection, find the tiles it's hovering over.
    if(this.selection && this.canPlace(this.selection)) {
      this.engineShip.segments.forEach((segment, index) => {
        if(index !== 0) {
          const [y, x] = segment.position;
          const tile = this.gameBoard.tiles[this.gameBoard.tilesByPosition[x][y]];
          this._currentHovers.push(tile)
        }
      })
    }

    const hovering = this._currentHovers.length > 0;
    const prevHovering = this._prevHovers.length > 0
    if (!hovering && prevHovering) {
      this.setViewerData(prev => {
        return ({ ...prev, currentHover:null })
      });
    }

    // If we have any current hovers or previous hovers, return true so they get handled.
    return hovering || prevHovering;
  }

  handleHovers() {
    // If we were already hovering over any items...
    // Find new hovers and abandoned hovers.
    const newHovers = this._currentHovers.filter(currentHoverable => !this._prevHovers.includes(currentHoverable));
    const abandonedHovers = this._prevHovers.filter(prevHoverable => !this._currentHovers.includes(prevHoverable));

    if(this.newMainHover) {
      console.log("adding mainHover to newHovers:");
      console.log(this.mainHover)
      newHovers.unshift(this.mainHover)
    }
    //If any of the hovers are selected, we don't do hover behavior for that entity.
    newHovers.forEach(this.handleNewHover);
    abandonedHovers.forEach(this.handleAbandonedHover);

    const currentHover = this._currentHovers.map(hoverable => hoverable.hoverData)[0]

    if(newHovers.length > 0) {
      this.setViewerData(prev => ({ ...prev, currentHover, newHovers }));
    }
    this._prevHovers = this._currentHovers;

    return true;
  }

  handleNewHover(hoverable) {
    // If it's not selected, do its onHover action.
    !hoverable.selected && hoverable.onHover();

    const selection = this.selection;

    // If there's a selected ship that can move to this hoverable,
    // move it and update the tiles its segments are hovering over!
    if(hoverable === this.mainHover &&
       selection && 
       selection.canMoveTo(hoverable)) {
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

  place(selection) {
    selection.onPlace();
    this.sendPlaceShipMove(selection.id)
  }

  unplace(selection) {

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

  sendUnplaceShipMove(shipID) {
    this.setMoveData({
      moveType: MOVES.UNPLACE_SHIP.NAME,
      targetPlayerID: this.playerID,
      playerID: this.playerID,
      shipID
    })
  }
}

export { BattleshipControls };