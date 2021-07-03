import { useState } from 'react'

// Engine
const { GameEngine, CONSTANTS } = require('@itspladd/battleship-engine')

export default function useGameEngine(players) {
  const [engine, setEngine] = useState(new GameEngine(players));
  const [moves, setMoves] = useState(CONSTANTS.RULES.DEFAULT_RULES.MOVES);
  const [gameState, setGameState] = useState(engine.gameState);

  const makeMove = async (move) => {
    const results = await engine.inputMove(move);
    setGameState(results.gameState)
    return results.valid;
  }

  return [engine, moves, gameState, makeMove]
}