import * as THREE from 'three'
const { TILE_RADIUS, TILE_HEIGHT } = require('../constants/3DBOARD').TILE_GEOMETRY

// An Entity is an object in the game world with a position and a rotation.
class Entity {

  // Horizontal distance from center of one tile to center of next
  static xPerTile = 1.5 * TILE_RADIUS;
  // Vertical distance from center of one tile to center of next
  static yPerTile = 2 * TILE_HEIGHT;
  // Extra vertical offset for odd-numbered columns
  static oddColumnOffset = Entity.yPerTile / 2;

  static defaultZ = 0;

  constructor(mesh) {
    this._mesh = mesh || null;
  }

  get mesh() {
    return this._mesh;
  }

  get meshPosition() {
    return this._mesh.position;
  }

  get meshX() {
    return this._mesh.position.x;
  }

  get meshY() {
    return this._mesh.position.y;
  }

  get meshZ() {
    return this._mesh.position.z;
  }

  get angle() {
    const zQuat = new THREE.Quaternion(0, 0, 0, 1)
    return Math.round((this._mesh.quaternion.angleTo(zQuat) * 360) / (2 * Math.PI))
  }

  get boardX() {
    return Math.round(this.meshX / Entity.xPerTile)
  }

  get boardY() {
    const offset = (this.boardX % 2) * Entity.oddColumnOffset
    return -1 * Math.round((this.meshY - offset) / Entity.yPerTile)
  }

  get boardZ() {
    return this.meshZ;
  }

  get boardPosition() {
    return [this.boardX, this.boardY];
  }

  set mesh(newMesh) {
    this._mesh = newMesh;
  }

  // Given an integer X and Y and optional Z
  set boardPosition(vector3) {
    const [x, y, z] = vector3;

    // meshX is just number of tiles times x per tile
    const meshX = x * Entity.xPerTile;

    // If the column is odd (x%2 = 1), add the extra offset to y value
    // (because of how hex grids work)
    // It's also negative bc we move downward from the origin
    const meshY = -1 * y * Entity.yPerTile + ((x % 2) * Entity.oddColumnOffset);

    // If z is non-zero falsy (i.e. not provided), set it to default;
    // otherwise save it.
    const meshZ = (!z && z !== 0) ? Entity.defaultZ : z;

    // Actually set the locations.
    this.mesh.position.x = meshX;
    this.mesh.position.y = meshY;
    this.mesh.position.z = meshZ;
  }

  set angle(deg) {
    // Rotation begins in the opposite direction you expect, so we flip the amount.
    deg = -1 * (deg - 360)
    const rad = (deg / 360) * 2 * Math.PI
    console.log(rad)
    const zAxis = new THREE.Vector3(0, 0, 1);
    this.mesh.setRotationFromAxisAngle(zAxis, rad)
  }

  set boardX(x) {
    this.boardPosition = [x, this.boardY, this.boardZ]
  }

  set boardY(y) {
    this.boardPosition = [this.boardX, y, this.boardZ]
  }

  set boardZ(z) {
    this.boardPosition = [this.boardX, this.boardY, z]
  }
}

export default Entity;