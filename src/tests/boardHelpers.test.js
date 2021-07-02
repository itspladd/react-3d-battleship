import {
  boardCoordinatesToSceneCoordinates
} from '../helpers/boardHelpers'

describe('boardCoordinatesToSceneCoordinates', () => {
  it('should return 0, 0 when given 0, 0', () => {
    const parameters = {
      x: 0,
      y: 0,
      tileRadius: 1,
      tileHeight: 1
    }
    const [resultX, resultY] = boardCoordinatesToSceneCoordinates(parameters)
    expect(resultX).toEqual(0)
    expect(resultY).toEqual(0)
  })
})