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
  });
  it('should return 1.5, 1 when given 1, 0', () => {
    const parameters = {
      x: 1,
      y: 0,
      tileRadius: 1,
      tileHeight: 1
    }
    const [resultX, resultY] = boardCoordinatesToSceneCoordinates(parameters)
    expect(resultX).toEqual(1.5)
    expect(resultY).toEqual(1)
  });
  it('should return 7.5, 11 when given 5, 5', () => {
    const parameters = {
      x: 5,
      y: 5,
      tileRadius: 1,
      tileHeight: 1
    }
    const [resultX, resultY] = boardCoordinatesToSceneCoordinates(parameters)
    expect(resultX).toEqual(7.5)
    expect(resultY).toEqual(11)
  })
})