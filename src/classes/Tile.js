import * as THREE from 'three';
import { TILE_GEOMETRY, MATERIALS, COLORS } from '../constants/3DBOARD';

const Game = require('./Game');

const { TILE_RADIUS, TILE_HEIGHT, TILE_THICKNESS, TILE_BASE } = TILE_GEOMETRY;

class Tile {
  static boardColor = new THREE.Color(COLORS.PLAYER_BOARD_TILE_BASE_COLOR);
  static boardHoverColor = new THREE.Color(COLORS.PLAYER_BOARD_TILE_HOVER_COLOR);
  static fillerColor = new THREE.Color(COLORS.TILE_NONINTERACTIVE_COLOR)
  static material = new THREE.MeshStandardMaterial({...MATERIALS.TILE_MATERIAL});
  static geometry = new THREE.CylinderBufferGeometry(TILE_RADIUS * .95, TILE_RADIUS, TILE_THICKNESS, 6)
                    .rotateX(Math.PI * 0.5)  // Turn the tile so it's laying "flat"
                    .rotateZ(Math.PI * 0.5); // Turn the tile to "point" sideways

  constructor() {
    this._timestamp = Date.now();
  }
}

class InstancedTile extends Tile {

  constructor(id, mesh, position, color = Tile.fillerColor) {
    super();
    this._id = id;
    this._mesh = mesh;
    this._color = color;
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

  onHover() {
    this.color = this._hoverColor;
  }

  onHoverExit() {
    this.color = this._color;
  }
}

class PlayerBoardTile extends HoverableTile {
  constructor(id, mesh, position, owner) {
    super(id, mesh, position, Tile.boardColor, Tile.boardHoverColor);
    console.log('made a board tile, id:', id)
    this._owner = owner;
  }

  get owner() {
    return this._owner;
  }

  // Position on this specific game board using integer values.
  get boardPosition() {
    return [this._x - this.owner.startX, this._y - this.owner.startY]
  }
}

const Tiles = {
  Tile,
  InstancedTile,
  HoverableTile,
  PlayerBoardTile
};

export default Tiles;