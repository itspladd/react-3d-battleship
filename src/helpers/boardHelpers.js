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

  return [0, 0]
}

module.exports = {
  boardCoordinatesToSceneCoordinates
}