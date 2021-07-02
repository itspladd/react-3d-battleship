// Give it [x, y] for a tile and [xOffset, yOffset] for a location,
// and get back the coordinates in the scene where the center of that tile exists.
const boardCoordinatesToSceneCoordinates = function ({
  x,
  y,
  xOffset,
  yOffset,
  tileRadius,
  tileHeight
}) {
  // If no x/y offset given, set them to 0
  xOffset = xOffset || 0;
  yOffset = yOffset || 0;
  let newX = 0;
  let newY = 0;

  // Horizontal distance from center of one tile to center of next
  const xOffsetPerTile = 1.5 * tileRadius;
  // Vertical distance from center of one tile to center of next
  const yOffsetPerTile = 2 * tileHeight;
  // Extra vertical offset for odd-numbered columns;
  const oddColumnOffset = yOffsetPerTile / 2;

  newX = x * xOffsetPerTile;
  // If the column is odd (x%2 = 1), add the extra offset to the Y
  newY = y * yOffsetPerTile + ((x % 2) * oddColumnOffset);

  return [newX, newY]
}

module.exports = {
  boardCoordinatesToSceneCoordinates
}