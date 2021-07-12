import * as THREE from 'three';

import Tiles from './Tile'
const { Tile, PlayerBoardTile } = Tiles;

class Board {
  constructor(owner, boardData, boundaries) {
    this._owner = owner;
    console.log(boundaries)
    const { startX, startY, endX, endY } = boundaries;
    this._start = [startX, startY];
    this._end = [endX, endY];
    this._rows = boardData.rows
    this._columns = boardData.columns
    console.log('new board, ', this._start, this._end)
    this.tileMesh = new THREE.InstancedMesh(Tile.geometry, Tile.material, this.numTiles)

    this.tiles = this.makeTiles()
    //this.tileMesh.instanceColor.needsUpdate = true;
    this.tileMesh.instanceMatrix.needsUpdate = true;
  }

  get startX() {
    return this._start[0];
  }

  get startY() {
    return this._start[1];
  }

  get endX() {
    return this._end[0];
  }

  get endY() {
    return this._end[1];
  }

  get dimensions() {
    return [this._rows, this._columns]
  }

  get numTiles() {
    return this._rows * this._columns
  }

  makeTiles() {
    console.log('making tiles')
    let tileId = 0;
    const tiles = {}
    for(let x = this.startX; x <= this.endX; x++) {
      for (let y = this.startY; y <= this.endY; y++) {
        const position = [x, y, 0];
        console.log('making tile at', x, y)
        tiles[tileId] = new PlayerBoardTile(tileId, this.tileMesh, position, this)
        tileId++;
      }
    }

    return tiles;
  }

}

export default Board;