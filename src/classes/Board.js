import * as THREE from 'three';

import Tiles from './Tile'
const { Tile, PlayerBoardTile } = Tiles;

class Board {
  constructor(owner, boardData, boundaries) {
    this._owner = owner;
    const { startX, startY, endX, endY } = boundaries;
    this._start = [startX, startY];
    this._end = [endX, endY];
    this._rows = boardData.rows;
    this._columns = boardData.columns;
    this.tileMesh = new THREE.InstancedMesh(Tile.geometry, Tile.material, this.numTiles)

    this.tiles = this.makeTiles(boardData);
    this.ships = this.makeShips(boardData)

    console.log(boardData)
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

  makeTiles(boardData) {
    let tileId = 0;
    let y = this.startY;
    const tiles = {}
    const tileMatrix = [];
    for(const row of boardData.tiles) {
      const tileMatrixRow = [];
      let x = this.startX;
      for (const tile of row) {
        const position = [x, y, 0];
        tiles[tileId] = new PlayerBoardTile(tileId, this.tileMesh, position, this)
        tileMatrixRow.push(tileId);
        tileId++;
        x++;
      }
      y++;
      tileMatrix.push(tileMatrixRow);
    }
    console.log(tileMatrix)
    return tiles;
  }

  makeShips(boardData) {
    console.log(boardData.ships)
  }
}

export default Board;