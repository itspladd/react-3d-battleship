import { useEffect, useRef, useState } from 'react'

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
  const gameStateRef = useRef(engine.gameState);

  useEffect(() => {
    setMoves(CONSTANTS.RULES.DEFAULT_RULES.MOVES)
  }, [])


  const makeMove = async (move) => {
    console.log('making a move: ', move)
    const results = await engine.inputMove(move);
    gameStateRef.current = results.gameState
    return results;
  }

  return [engine, moves, gameStateRef, makeMove]
}