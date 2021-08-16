import Board from './Board'

class Player {
  constructor(owner, playerData, boardBoundary) {
    const { id, name, rules, board } = playerData;
    this._owner = owner;
    this._id = id;
    this._engine = this._owner.engine.players[id]
    this._name = name;
    this._rules = rules;

    this.board = new Board(this, board, boardBoundary)
  }

  get engine() {
    return this._engine;
  }

  get id() {
    return this._id;
  }
}

export default Player;