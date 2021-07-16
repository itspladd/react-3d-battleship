import * as THREE from 'three';
import Ship from './Ship';

import Tiles from './Tile'
const { Tile, PlayerBoardTile } = Tiles;

const { SHIP_NULL_START } = require('../constants/3DBOARD').BOARD_DIMENSIONS

class Board {
  constructor(owner, boardData, boundaries) {
    this._owner = owner;
    const { startX, startY, endX, endY } = boundaries;
    this._start = [startX, startY];
    this._end = [endX, endY];
    this._rows = boardData.rows;
    this._columns = boardData.columns;
    this.tileMesh = new THREE.InstancedMesh(Tile.geometry, Tile.material, this.numTiles)

    const [tilesById, tilesByPosition] = this.makeTiles(boardData);
    this.tilesById = tilesById;
    this.tilesByPosition = tilesByPosition;
    this.ships = this.makeShips(boardData);

  }

  get tiles() {
    return this.tilesById;
  }

  get shipsArr() {
    return Object.values(this.ships);
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

  get playerId() {
    return this._owner.id;
  }

  get shipMeshes() {
    return Object.values(this.ships).map(ship => ship.mesh)
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
        const tileType = tile.typeStack[tile.typeStack.length - 1];
        tiles[tileId] = new PlayerBoardTile(tileId, this.tileMesh, position, this, tileType);
        tileMatrixRow.push(tileId);
        tileId++;
        x++;
      }
      y++;
      tileMatrix.push(tileMatrixRow);
    }

    return [tiles, tileMatrix];
  }

  makeShips(boardData) {
    const shipsData = boardData.ships;
    const ships = {}
    let nullCounter = 0;
    const {x, y, angle} = SHIP_NULL_START;
    for (let shipId in shipsData) {
      const nullPosition = {x: (2 * nullCounter + x), y, angle};
      const shipData = { ...shipsData[shipId], nullPosition }
      ships[shipId] = new Ship(shipData)
      nullCounter++;
    }

    return ships;
  }
}

export default Board;