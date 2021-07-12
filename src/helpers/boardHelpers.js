
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


module.exports = {
  tileInBoard,
  tileRelativePosition,
  getWorldPosition
}