# Multiplayer Game Logic

This document outlines how the frontend and backend will communicate to allow two people to play a Battleship game.

## Starting a Game

1. A user clicks "New Game."
  - The client creates a GUID for the game.
  - The client shows the user the options for the game, which they can configure. They also have an small in-lobby chat where they can see other users as they join
  - The client emits a "game:lobby-new" event with the host's ID and game's GUID
2. The server receives the "game:new-lobby" event
  - The server creates a new socket.io room for that game and has the host join it
  - The server emits a "game:new-lobby" event to all clients
3. The client receives a "game:new-lobby" event
  - The client adds the new lobby to the state
4. A different user clicks on a lobby
  - The client sends a "game:join-lobby--attempt" event to server
5. The server receives the "game:join-lobby--attempt" event
  - The server checks if the requested lobby is full
    - If full, the server sends a "game:join-lobby--failed" event back
    - If not, the server adds the user to the room and sends a "game:join-lobby--success" to the user and a "game:lobby


## Playing a Game
1. Both users have joined the game and are presented with the "place ships" instructions
2. 