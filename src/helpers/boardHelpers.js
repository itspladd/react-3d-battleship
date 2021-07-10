// Set up constants
const {
  ROWS_TOP,
  ROWS_BOTTOM,
  COLUMNS_LEFT,
  COLUMNS_RIGHT,
  COLUMNS_BETWEEN
} = require('../constants/3DBOARD').BOARD_DIMENSIONS;

const { TILE_RADIUS, TILE_HEIGHT, TILE_BASE } = require('../constants/3DBOARD').TILE_GEOMETRY

// Give it [x, y] for a tile and [xOffset, yOffset] for a location,
// and get back the coordinates in the scene where the center of that tile exists.
const boardCoordinatesToSceneCoordinates = function ({
  col,
  row,
  xOffset,
  yOffset
}) {
  // If no x/y offset given, set them to 0
  xOffset = xOffset || 0;
  yOffset = yOffset || 0;
  let newX = 0;
  let newY = 0;

  // Horizontal distance from center of one tile to center of next
  const xOffsetPerTile = 1.5 * TILE_RADIUS;
  // Vertical distance from center of one tile to center of next
  const yOffsetPerTile = 2 * TILE_HEIGHT;
  // Extra vertical offset for odd-numbered columns;
  const oddColumnOffset = yOffsetPerTile / 2;

  newX = col * xOffsetPerTile;
  // If the column is odd (x%2 = 1), add the extra offset to the Y
  newY = row * yOffsetPerTile + ((col % 2) * oddColumnOffset);
  newY *= -1 // Make the Y negative!

  return [newX, newY]
}

// Check all player boards to see if a tile is inside the boundaries of that board.
// Return the data about that board.
const tileInBoard = (boardBoundaries, tilePos) => {
  for (const boundaryData of boardBoundaries) {
    const { id, startX, startY, endX, endY } = boundaryData;
    const [x, y] = tilePos;
    if (x >= startX && x <= endX && y >= startY && y <= endY) {
      return [id, startX, startY];
    }
  }

  return [null, null, null];
}

const tileRelativePosition = (startX, startY, tileX, tileY) => {
  return [tileX - startX, tileY - startY]
}

const getWorldPosition = (x, y, offsetX, offsetY) => {
  return [x + offsetX, y + offsetY]
}

const determinePlayerBoardBoundaries = (gameState, firstBoardPlayerId) => {
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

const determineBoardDimensions = gameState => {
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

module.exports = {
  boardCoordinatesToSceneCoordinates,
  determinePlayerBoardBoundaries,
  tileInBoard,
  tileRelativePosition,
  determineBoardDimensions,
  getWorldPosition
}