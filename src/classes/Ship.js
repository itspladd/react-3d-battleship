import * as THREE from 'three'
import Game from './Game'
import Entity from './Entity'
import Tiles from './Tile'

import { TILE_GEOMETRY, MATERIALS, COLORS } from '../constants/3DBOARD';

const { PlayerBoardTile } = Tiles;
const { TILE_HEIGHT, TILE_BASE } = TILE_GEOMETRY;


class Ship extends Entity {

  static color = new THREE.Color(0x666666);
  static hoverColor = new THREE.Color(0x888888);
  static zOffset = 0.5 + TILE_BASE;
  static nullZOffset = 0;

  static makeSegments(type, segments) {
    // Create each segment mesh and add it to the array of segments
    const segmentArr = segments.map((segment, index) => {
      const mesh = Ship.makeSegmentMesh(type, index);
      mesh.position.y = index * (2 * TILE_HEIGHT);
      return {
        ...segment,
        mesh
      }
    })

    // Create the group that holds all the segments for positioning
    const segmentGroup = new THREE.Group();
    segmentArr.forEach(segment => segmentGroup.add(segment.mesh))

    return [segmentArr, segmentGroup]
  }

  static makeSegmentMesh(type, index) {
    const segmentLength = TILE_HEIGHT * 2;
    const segmentGeom = new THREE.BoxGeometry( 1, segmentLength, 1)
    const material = new THREE.MeshBasicMaterial( {color: Ship.color} );

    return new THREE.Mesh(segmentGeom, material);
  }

  constructor({typeStr, segments, angle, position, nullPosition, id, owner}) {

    const [segmentArr, segmentGroup] = Ship.makeSegments(typeStr, segments);
    // Run the Entity constructor to save segmentGroup as this._mesh:
    super(segmentGroup)
    this._owner = owner;
    this._type = typeStr;
    this._segmentArr = segmentArr;
    this._segmentGroup = segmentGroup;
    this._angle = angle;
    this._id = id;
    this._nullPosition = nullPosition;
    this._selected = false;
    this._hovered = false;
    this._placed = false;
    this.placeAtNull();
  }

  get owner() {
    return this._owner;
  }

  get id() {
    return this._id;
  }

  get segmentMeshes() {
    return this._segmentGroup.children;
  }

  get nullX() {
    return this._nullPosition[0];
  }

  get nullY() {
    return this._nullPosition[1];
  }

  get nullAngle() {
    return this._nullPosition[2];
  }

  get atNull() {
    return this.boardX === this.nullX &&
           this.boardY === this.nullY;
  }

  get enginePosition() {
    return this.atNull ? null : [this.boardX - this.owner.startX, this.boardY - this.owner.startY]
  }

  get hovered() {
    return this._hovered;
  }

  get selected() {
    return this._selected;
  }

  get placed() {
    return this._placed;
  }

  set placed(newVal) {
    this._placed = newVal;
  }

  get hoverData() {
    return {
      id: this._id,
      position: this.boardPosition,
      angle: this._angle,
      nullPosition: this._nullPosition,
      type: this._type,
      placed: this.placed
    }
  }

  set color(color) {
    this._segmentArr.forEach(segment => {
      segment.mesh.material.color = color;
    })
  }

  placeAtNull() {
    const [x, y, angle] = this._nullPosition;
    this.angle = angle;
    this.boardPosition = [x, y]
  }

  currentHover(raycaster) {
    return raycaster.intersectObjects(this.segmentMeshes).length > 0 && this;
  }

  onHover() {
    this._hovered = true;
    this.color = Ship.hoverColor;
  }

  onHoverExit() {
    this._hovered = false;
    this.color = Ship.color;
  }

  onSelect() {
    this._selected = true;
    this._placed = false;
    this.color = Ship.hoverColor;
    this.boardZ = Entity.hoverZ;
  }

  onDeselect() {
    this._selected = false;
    this.color = Ship.color;
  }

  onPlace() {
    this._placed = true;
  }

  canMoveTo(target) {
    return target instanceof PlayerBoardTile &&
           target.owner.playerId === this.owner.playerId
  }
}

export default Ship;