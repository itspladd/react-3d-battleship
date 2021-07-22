/**********************************
 * CONSTANTS FOR BOARD DIMENSIONS
 */
const ROWS_TOP = 4;
const ROWS_BOTTOM = 4;
const COLUMNS_LEFT = 4;
const COLUMNS_RIGHT = 4;
const COLUMNS_BETWEEN = 2;

const SHIP_NULL_START = {
  x: 0,
  y: -1,
  angle: 60
}

const BOARD_DIMENSIONS = {
  ROWS_TOP,
  ROWS_BOTTOM,
  COLUMNS_LEFT,
  COLUMNS_RIGHT,
  COLUMNS_BETWEEN,
  SHIP_NULL_START
}

/**********************************/

/**********************************
 * CONSTANTS FOR HEX TILE GEOMETRY
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

// Bundled object for export
const TILE_GEOMETRY = {
  TILE_RADIUS,
  TILE_HEIGHT,
  TILE_THICKNESS,
  TILE_SIDE,
  TILE_BASE
}
/**********************************/

/**********************************
 * CONSTANTS FOR MATERIALS
 */

const TILE_MATERIAL = {
  color: 0xffffff, // If the base color is white, we can apply any other color easily!
  roughness: 0.6,
  metalness: 0.5
}

// Bundled object for export
const MATERIALS = {
  TILE_MATERIAL
}
/**********************************/

/**********************************
 * HEX VALUE CONSTANTS FOR COLORS
 */

// TILES
const PLAYER_BOARD_TILE_BASE_COLOR = 0x0066ff;
const PLAYER_BOARD_TILE_HOVER_COLOR = 0x4477ff;
const TILE_NONINTERACTIVE_COLOR = 0x0044dd;

// LIGHTS
const LIGHT_BASE_COLOR = 0xffffff;

// Bundled object for export
const COLORS = {
  PLAYER_BOARD_TILE_BASE_COLOR,
  PLAYER_BOARD_TILE_HOVER_COLOR,
  TILE_NONINTERACTIVE_COLOR,
  LIGHT_BASE_COLOR
}
/**********************************/

module.exports = {
  BOARD_DIMENSIONS,
  TILE_GEOMETRY,
  MATERIALS,
  COLORS
}