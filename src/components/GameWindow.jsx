import { useState } from 'react';
import * as THREE from 'three';
import '../styles/GameWindow.css'

const  { GameEngine, CONSTANTS } = require('@itspladd/battleship-engine')

export default function GameWindow() {
  const players = [
    {id: 'p1', name: 'Trapezius'},
    {id:'p2', name: 'Tautrion'}
  ];
  const engine = new GameEngine(players)

  return (
    <div className="game-window">
      <p>Game window</p>
      <p>{JSON.stringify(engine.gameState)}</p>
    </div>
  )
}