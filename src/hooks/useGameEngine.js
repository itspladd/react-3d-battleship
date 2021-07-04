import { useEffect, useState } from 'react'

// Engine
const { GameEngine, CONSTANTS } = require('@itspladd/battleship-engine')

export default function useGameEngine() {
  // Dummy players object to hold dev data.
  const players = [
    { id: 'p1', name: 'Trapezius' },
    { id: 'p2', name: 'Tautrion' }
  ];
  const newEngine = new GameEngine({players})
  newEngine.timestamp = Date.now();
  const [engine, setEngine] = useState(newEngine);
  const [moves, setMoves] = useState({});
  const [gameState, setGameState] = useState(engine.gameState);

  useEffect(() => {
    setMoves(CONSTANTS.RULES.DEFAULT_RULES.MOVES)
  }, [])


  const makeMove = async (move) => {
    console.log('making a move: ', move)
    const results = await engine.inputMove(move);
    setGameState(results.gameState)
    return results.valid;
  }

  return [engine, moves, gameState, makeMove]
}