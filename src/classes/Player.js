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

  get id() {
    return this._id;
  }
}

export default Player;