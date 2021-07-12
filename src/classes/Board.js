import * as THREE from 'three';

const { Tile, PlayerBoardTile } = require('./Tile')

class Board {
  constructor(owner, boardData, boundaries) {
    this._owner = owner;
    const { startX, startY, endX, endY } = boundaries;

    this._start = [startX, startY];
    this._end = [endX, endY];
    this._rows = boardData.rows
    this._columns = boardData.columns
  
    this.tileMesh = new THREE.InstancedMesh(Tile.geometry, Tile.material, this.numTiles)

    this.tiles = this.makeTiles()
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
    let tileId = 0;
    const tiles = {}
    for(let x = this.startX; x <= this.endX; x++) {
      for (let y = this.startY; y <= this.endY; y++) {
        const position = [x, y, 0];
        tiles[tileId] = new PlayerBoardTile(tileId, this.tileMesh, position, this)
      }
    }
  }

}

export default Board;