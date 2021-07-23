import * as THREE from 'three';

// Classes
import Player from './Player'
import Tiles from './Tile'

const { Tile, InstancedTile } = Tiles;

// Helpers
const { getNeighborsInDirection } = require('@itspladd/battleship-engine').HELPERS.positionHelpers

// Constants
const { TILE_RADIUS, TILE_HEIGHT } = require('../constants/3DBOARD').TILE_GEOMETRY
const {
  ROWS_TOP,
  ROWS_BOTTOM,
  COLUMNS_LEFT,
  COLUMNS_RIGHT,
  COLUMNS_BETWEEN
} = require('../constants/3DBOARD').BOARD_DIMENSIONS;


class Game {

  /**************************************************
  STATIC METHODS
  **************************************************/

  static baseRotationMatrix = new THREE.Matrix4().makeRotationX(Math.PI)

  static moveObject(threeObj, translation, rotation) {
    const [x, y, z] = translation;
    this.moveObjectBy(threeObj, x, y, z)
    this.rotateObjDeg(threeObj, rotation)
  }

  static rotateObjDeg(threeObj, deg) {
    // Rotation begins in the opposite direction you expect, so we flip the amount.
    deg = -1 * (deg - 360)
    const rad = (deg / 360) * 2 * Math.PI

    threeObj.rotateZ(rad)
  }

  static moveObjectBy(threeObj, x, y, z) {
    const matrix = this.getXYZMatrix(x, y, z);
    threeObj.applyMatrix(matrix)
  }

  static getXYZMatrix(x, y, z) {
    const [newX, newY] = this.getXYCoordinates(x, y);
    const matrix = new THREE.Matrix4();
    matrix.makeTranslation(newX, newY, z);

    return matrix;
  }

  /*****************
   * get3DCoordinates(x: int, y: int)
   * Given an integer x and y, calculate the float x and y based on tile size.
   * Returns [floatX, floatY]
  */
  static getXYCoordinates(x, y) {
    // Horizontal distance from center of one tile to center of next
    const xPerTile = 1.5 * TILE_RADIUS;
    // Vertical distance from center of one tile to center of next
    const yPerTile = 2 * TILE_HEIGHT;
    // Extra vertical offset for odd-numbered columns;
    const oddColumnOffset = yPerTile / 2;

    // floatX is just number of tiles * offset per tile
    const floatX = x * xPerTile;
    // If the column is odd (x%2 = 1), add the extra offset to the Y
    // (hex tiles function weird)
    const floatY = y * yPerTile + ((x % 2) * oddColumnOffset);

    // Make the Y negative!
    return [floatX, floatY * -1]
  }

  /**************************************************
  END OF STATIC METHODS
  **************************************************/

  constructor(gameStateRef, ownerId) {
    this._ownerId = ownerId;
    this._gameStateRef = gameStateRef;

    this.mapDimensions = this.mapDimensions(this.currentState);
    this.boardBoundaries = this.findPlayerBoundaries(this.currentState, ownerId)

    // Players create Boards during construction.
    // Boards include Tiles and Ships, so look in Board.js for Tile/Ship init.
    this.players = this.initPlayers(this.currentState, this.boardBoundaries);
    this.fillerTiles = this.initFillerTiles();
  }

  get mapRows() {
    return this.mapDimensions[0];
  }

  get mapColumns() {
    return this.mapDimensions[1];
  }

  get totalTiles() {
    return this.mapRows * this.mapColumns;
  }

  get playerShipMeshes() {
    return this.players[this._ownerId].board.shipMeshes;
  }

  get currentState() {
    return this._gameStateRef.current;
  }

  get owningPlayer() {
    return this.players[this._ownerId];
  }
  
  get playersArr() {
    return Object.values(this.players);
  }

  get hoverables() {
    const playerShips = this.owningPlayer.board.shipsArr;
    const boards = this.playersArr.map(player => player.board)
    return [...playerShips, ...boards, ]
  }

  get selectables() {
    const playerShips = this.owningPlayer.board.shipsArr;
    return [...playerShips]
  }

  initPlayers(gameState, boardBoundaries) {
    const players = {}
    for (let id in gameState.players) {
      const currentBoardBoundaries = boardBoundaries
        .filter(boundary => boundary.id === id)
        [0]
      players[id] = new Player(this, gameState.players[id], currentBoardBoundaries)
    }

    return players;
  }

  initFillerTiles() {
    const fillerTileMesh = new THREE.InstancedMesh(Tile.geometry, Tile.material, this.totalTiles)
    fillerTileMesh.frustumCulled = false;
    const fillerTiles = {};
    let tileCounter = 0;

    for (let x = 0; x < this.mapColumns; x++) {
      for (let y = 0; y < this.mapRows; y++) {
        if (!this.locationInBoardBoundaries(x, y)) {
          const position = [x, y, 0];
          fillerTiles[tileCounter] = new InstancedTile(tileCounter, fillerTileMesh, position)
          tileCounter++;
        }
      }
    }
    return fillerTileMesh;
  }

  findPlayerBoundaries = (gameState, firstBoardPlayerId) => {
    // firstBoardPlayerId: the ID of the player whose board should be first.
    // Assumes that all boards are placed horizontally next to each other.
    const playersArr = Object.values(gameState.players);

    // "Rotate" the array until the first player ID is the same as the input ID
    while(playersArr[0].id !== firstBoardPlayerId) {
      playersArr.push(playersArr.shift());
    }
    const playerBoundaries = [];
    let currentX = COLUMNS_LEFT - 1; // Offset by 1 to account for 0-index
    for (let i = 0; i < playersArr.length; i++) {
      const currentPlayer = playersArr[i];
      const id = currentPlayer.id;

      // Move right 1 from where we stopped last. Add spacer columns between boards.
      const startX = 1 + currentX + COLUMNS_BETWEEN * i;
      const startY = ROWS_TOP;

      // Since startX and startY are on the first row/column, subtract 1 to account.
      const endX = startX + currentPlayer.board.columns - 1;
      const endY = startY + currentPlayer.board.rows - 1;
      currentX = endX;
      playerBoundaries[i] = { id, startX, startY, endX, endY }
    }

    return playerBoundaries;
  }

  locationInBoardBoundaries(x, y) {
    const results = Object.values(this.boardBoundaries)
      .filter(boundary => {
        const { startX, startY, endX, endY } = boundary;
        return this.locationInArea(x, y, [startX, startY], [endX, endY])
      })
    return results.length !== 0;
  }

  locationInArea(x, y, startPos, endPos) {
    return x >= startPos[0] &&
           x <= endPos[0]   &&
           y >= startPos[1] &&
           y <= endPos[1]
  }

  mapDimensions(gameState) {
    const playersArr = Object.values(gameState.players);
    // Boards are drawn horizontally next to each other, so the
    // number of player rows is just one player's rows.
    // Columns need to be added from all players.
    const playerRows = playersArr[0].board.rows;
    const playerCols = playersArr.map(player => player.board.columns)
                      .reduce((a, b) => a + b);

    // Need one COLUMNS_BETWEEN between each player board.
    const spacerColsNeeded = playersArr.length - 1
    const spacerColsTotal = COLUMNS_BETWEEN * spacerColsNeeded

    const totalRows = playerRows + ROWS_TOP + ROWS_BOTTOM;
    const totalCols = playerCols + spacerColsTotal + COLUMNS_LEFT + COLUMNS_RIGHT;
    return [totalRows, totalCols]
  }

  update() {
    //Reposition every element on the board
    Object.values(this.currentState.players).forEach(player => {
      const playerId = player.id;
      const engineBoard = player.board;
      const engineShips = Object.values(engineBoard.ships);
      const viewerBoard = this.players[playerId].board
      const viewerShips = viewerBoard.ships
      engineShips.forEach(engineShip => {
        if(engineShip.position !== null) {
          viewerBoard.moveShip(engineShip.id, engineShip.position);
          viewerShips[engineShip.id].angle = engineShip.angle;
        }
      })
    })
  }
}

export default Game;