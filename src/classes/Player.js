import Board from './Board'

class Player {
  constructor(owner, playerData, boardBoundary) {
    const { id, name, rules, board } = playerData;
    this._owner = owner;
    this._id = id;
    this._name = name;
    this._rules = rules;

    this.board = new Board(this, board, boardBoundary)
  }
}

export default Player;