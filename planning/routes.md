# Routes

| HTTP method | URL pattern                       | Usage                                     |
|-------------|-----------------------------------|-------------------------------------------|
| POST        | /api/login                        | Log in a user                             |
| POST        | /api/authenticate                 | Check to see if a user is logged in or not|
| GET         | /api/users/user_id                | Get info about a user                     |
| POST        | /api/users                        | Create a new user                         |
| PATCH       | /api/users/:user_id               | Update user data if authorized            |
| DELETE      | /api/users/:user_id               | Delete a user if authorized               |
| GET         | /api/games                        | Get games                                 |
| POST        | /api/games                        | Create a new Game                         |
| PATCH       | /api/games/game_id                | Update data for a specific Game           |
| GET         | /api/boards                       | Get a list of all Boards                  |
| GET         | /api/rulesets                     | Get a list of all Rulesets                |