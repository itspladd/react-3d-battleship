import * as THREE from 'three'
import Game from './Game'

import { TILE_GEOMETRY, MATERIALS, COLORS } from '../constants/3DBOARD';

const { TILE_HEIGHT, TILE_BASE } = TILE_GEOMETRY;


class Ship {

  static color = new THREE.Color(0x666666);
  static hoverColor = new THREE.Color(0x888888);

  constructor({typeStr, segments, angle, position, nullPosition, id}) {

    this._type = typeStr;
    const [segmentArr, segmentGroup] = this.makeSegments(this._type, segments);
    this._segmentArr = segmentArr;
    this._segmentGroup = segmentGroup;
    this._angle = angle;
    this._position = position;
    this._id = id;
    this._nullPosition = nullPosition;
    this.placeAtNull();
  }

  get mesh() {
    return this._segmentGroup;
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

  placeAtNull() {
    const {x, y, angle} = this._nullPosition;
    Game.positionObject(this.mesh, [x, y, 0 ], angle)
  }

  onHover() {
    this.color = Ship.hoverColor;
  }

  onHoverExit() {
    this.color = Ship.color;
  }
}

export default Ship;