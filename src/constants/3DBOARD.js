/**********************************
 * CONSTANTS FOR HEX TILE DIMENSIONS
 */

// Distance from tile center to a given vertex
const TILE_RADIUS = 1.0;

// Distance from tile center to center of a given side
// calculation: R * sin(60 deg. or 2pi/6 rad.)
const TILE_HEIGHT = TILE_RADIUS * Math.sin(Math.PI / 3);

// Length of a single tile side
// Equal to HEX_RADIUS since this is a regular hexagon.
// CURRENTLY UNUSED.
const TILE_SIDE = TILE_RADIUS;

// How beefy is that tile
const TILE_THICKNESS = 0.25;

// The z-position of the center of a tile to get it to lay "flat" on the XY plane
// (i.e. the back of the tile is at z = 0)
const TILE_BASE = TILE_THICKNESS / 2;

const TILES = {
  TILE_RADIUS,
  TILE_HEIGHT,
  TILE_THICKNESS,
  TILE_SIDE,
  TILE_BASE
}

module.exports = {
  TILES
}