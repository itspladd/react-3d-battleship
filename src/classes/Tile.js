import * as THREE from 'three';
import { TILE_GEOMETRY, MATERIALS, COLORS } from '../constants/3DBOARD';

import Game from './Game';

const { TILE_RADIUS, TILE_HEIGHT, TILE_THICKNESS, TILE_BASE } = TILE_GEOMETRY;

class Tile {
  static boardColor = new THREE.Color(COLORS.PLAYER_BOARD_TILE_BASE_COLOR);
  static boardHoverColor = new THREE.Color(COLORS.PLAYER_BOARD_TILE_HOVER_COLOR);
  static fillerColor = new THREE.Color(COLORS.TILE_NONINTERACTIVE_COLOR)
  static material = new THREE.MeshStandardMaterial({...MATERIALS.TILE_MATERIAL});
  static geometry = new THREE.CylinderBufferGeometry(TILE_RADIUS * .95, TILE_RADIUS, TILE_THICKNESS, 6)
                    .rotateX(Math.PI * 0.5)  // Turn the tile so it's laying "flat"
                    .rotateZ(Math.PI * 0.5); // Turn the tile to "point" sideways

  constructor(type) {
    this._timestamp = Date.now();
  }
}

class InstancedTile extends Tile {

  constructor(id, mesh, position, color = Tile.fillerColor) {
    super();
    this._id = id;
    this._mesh = mesh;
    this._color = color; // Save the color of the tile
    this.color = color; // Actually set the color of the tile
    this._x = position[0];
    this._y = position[1];
    this.position3D = position;

  }

  get id() {
    return this._id;
  }

  get color() {
    return this._color;
  }

  set color(color) {
    this._mesh.setColorAt(this._id, color)
  }

  // Position in 3D space using float values.
  set position3D(vector3) {
    const [x, y, z] = vector3;
    this._mesh.setMatrixAt(this._id, Game.getXYZMatrix(x, y, z))
  }

  get position3D() {
    const matrix = this._mesh.getMatrixAt(this._id)
    const position = new THREE.Vector3();
    position.setFromMatrixPosition(matrix);
    return position;
  }

  // Position in global tile set using integer values.
  get position() {
    return [this._x, this._y];
  }
}

class HoverableTile extends InstancedTile {
  constructor(id, mesh, position, color, hoverColor) {
    super(id, mesh, position, color);
    this._hoverColor = hoverColor;
  }

  currentlyHovered(raycaster) {
    return raycaster.intersectObject(this._mesh)[0].instanceId === this.id;
  }

  onHover() {
    this.color = this._hoverColor;
    this._mesh.instanceColor.needsUpdate = true;
  }

  duringHover() {

  }

  onHoverExit() {
    this.color = this._color;
    this._mesh.instanceColor.needsUpdate = true;
  }

  get hoverData() {
    return {
      id: this.id,
      position: this.position,
      color: this.color.getHexString(),
      hoverColor: this._hoverColor.getHexString()
    }
  }

  get hoverable() {
    return true;
  }
}

class PlayerBoardTile extends HoverableTile {
  constructor(id, mesh, position, owner, type) {
    super(id, mesh, position, Tile.boardColor, Tile.boardHoverColor);
    this._owner = owner;
    this._engine = this.owner.engine.tiles[this.boardX][this.boardY]
    this._type = type;
  }

  get owner() {
    return this._owner;
  }

  get engine() {
    return this._engine;
  }

  get playerId() {
    return this._owner.playerId;
  }

  get hoverData() {
    const hoverableData = super.hoverData;
    return {
      ...hoverableData,
      player: this.playerId
    }
  }

  set type(newType) {
    this._type = newType;
  }

  get boardX() {
    return this._x - this.owner.startX;
  }

  get boardY() {
    return this._y - this.owner.startY
  }

  // Position on this specific game board using integer values.
  get boardPosition() {
    return [this.boardX, this.boardY]
  }
}

const Tiles = {
  Tile,
  InstancedTile,
  HoverableTile,
  PlayerBoardTile
};

export default Tiles;