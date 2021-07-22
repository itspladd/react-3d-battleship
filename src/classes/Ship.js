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
    this._sticky = true;
    this.placeAtNull();
  }

  get owner() {
    return this._owner;
  }

  get segmentMeshes() {
    return this._segmentGroup.children;
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

  get hoverData() {
    return {
      id: this._id,
      position: this.boardPosition,
      angle: this._angle,
      nullPosition: this._nullPosition,
      type: this._type,

    }
  }

  set color(color) {
    this._segmentArr.forEach(segment => {
      segment.mesh.material.color = color;
    })
  }

  updateMesh() {
    const absX = this.boardX + (this._position !== null && this.owner.startX);
    const absY = this.boardY + (this._position !== null && this.owner.startY);
    Game.positionObject(this.mesh, [absX, absY, this.z], this._angle)
  }

  placeAtNull() {
    const {x, y, angle} = this._nullPosition;
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
    this.color = Ship.hoverColor;
    this.boardZ = 1.5;
    console.log(this.angle)
  }

  onDeselect() {
    this._selected = false;
    this.color = Ship.color;
    this.boardZ = Ship.nullZOffset;
  }

  canMoveTo(target) {
    return target instanceof PlayerBoardTile &&
           target.owner.playerId === this.owner.playerId
  }
}

export default Ship;