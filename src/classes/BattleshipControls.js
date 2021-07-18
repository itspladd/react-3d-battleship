import {
	Vector3
} from 'three';

import { MapControls } from 'three/examples/jsm/controls/OrbitControls'

class BattleshipControls extends MapControls {
  constructor( object, domElement) {
    super( object, domElement );

    this.screenSpacePanning = false;

    // Put angle limits on the camera movement
    this.maxAzimuthAngle = 0;
    this.minAzimuthAngle = 0;
    this.maxPolarAngle = (3/16) * Math.PI;
    this.minPolarAngle = 0;

    const scope = this;
  }
}

export { BattleshipControls };