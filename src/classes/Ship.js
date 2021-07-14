import * as THREE from 'three'

import { TILE_GEOMETRY, MATERIALS, COLORS } from '../constants/3DBOARD';
const { TILE_HEIGHT, TILE_BASE } = TILE_GEOMETRY;


class Ship {
  constructor(shipData) {
    const {typeStr, segments, angle, position, id} = shipData;

    this._type = typeStr;
    const [segmentArr, segmentGroup] = this.makeSegments(this._type, segments);
    this._angle = angle;
    this._position = position;
    this._id = id;
  }

  makeSegments(type, segments) {
    const segmentArr = segments.map((segment, index) => {
      const object = this.makeSegmentObject(type, index);
      return {
        ...segment,
        object
      }
    })
    const segmentGroup = new THREE.Group();
    segments.forEach(segment => segmentGroup.add(segment.object))

    return [segmentArr, segmentGroup]
  }

  makeSegmentObject(type, index) {
    const segmentLength = TILE_HEIGHT * 2;
    const segmentGeom = new THREE.BoxGeometry( 1, segmentLength, 1)
    const material = new THREE.MeshBasicMaterial( {color: 0x666666} );

    return new THREE.Mesh(segmentGeom, material);
  }
}

export default Ship;