import * as THREE from 'three'
import Game from './Game'

import { TILE_GEOMETRY, MATERIALS, COLORS } from '../constants/3DBOARD';

const { TILE_HEIGHT, TILE_BASE } = TILE_GEOMETRY;


class Ship {

  static color = new THREE.Color(0x666666);
  static hoverColor = new THREE.Color(0x888888);
  static zOffset = 1 + TILE_BASE;

  constructor({typeStr, segments, angle, position, nullPosition, id, owner}) {

    this._type = typeStr;
    this._owner = owner;
    const [segmentArr, segmentGroup] = this.makeSegments(this._type, segments);
    this._segmentArr = segmentArr;
    this._segmentGroup = segmentGroup;
    this._angle = angle;
    this._position = position;
    this._id = id;
    this._nullPosition = nullPosition;
    this._selected = false;
    this._hovered = false;
    this._sticky = true;
    this.placeAtNull();
  }

  get owner() {
    return this._owner;
  }

  get mesh() {
    return this._segmentGroup;
  }

  get segmentMeshes() {
    return this._segmentGroup.children;
  }

  get hoverable() {
    return true;
  }

  get hovered() {
    return this._hovered;
  }

  get selected() {
    return this._selected;
  }

  get sticky() {
    return this._sticky;
  }

  get boardX() {
    return this._position[0];
  }

  get boardY() {
    return this._position[1];
  }

  get boardPosition() {
    return this._position;
  }

  get spaceX() {

  }

  get spaceY() {

  }

  get spacePosition() {

  }

  get hoverData() {
    return {
      id: this._id,
      position: this._position,
      angle: this._angle,
      nullPosition: this._nullPosition,
      type: this._type,

    }
  }

  set boardPosition(vector2) {
    this._position = [...vector2];
  }

  set angle(deg) {

  }

  set boardX(num) {
    this._position[0] = num;
  }

  set boardY(num) {
    this._position[1] = num;
  }

  set color(color) {
    this._segmentArr.forEach(segment => {
      segment.mesh.material.color = color;
    })
  }

  makeSegments(type, segments) {
    // Create each segment mesh and add it to the array of segments
    const segmentArr = segments.map((segment, index) => {
      const mesh = this.makeSegmentMesh(type, index);
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

  makeSegmentMesh(type, index) {
    const segmentLength = TILE_HEIGHT * 2;
    const segmentGeom = new THREE.BoxGeometry( 1, segmentLength, 1)
    const material = new THREE.MeshBasicMaterial( {color: Ship.color} );

    return new THREE.Mesh(segmentGeom, material);
  }

  placeAt(position, angle) {
    this.boardPosition = position;
    this._angle = angle;
    const absX = this.boardX + this.owner.startX;
    const absY = this.boardY + this.owner.startY;
    Game.positionObject(this.mesh, [absX, absY, Ship.zOffset], this._angle)
  }

  placeAtNull() {
    const {x, y, angle} = this._nullPosition;
    this._angle = angle;
    Game.positionObject(this.mesh, [x, y, Ship.zOffset ], angle)
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
    this.color = Ship.hoverColor;
  }

  onDeselect() {
    this._selected = false;
    this.color = Ship.color;
  }
}

export default Ship;