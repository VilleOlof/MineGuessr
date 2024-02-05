# MP-Server

This has the purpose of handling websocket connections and requests for multiplayer games.  

This is a seperated process from the website, because it was easier to handle websockets and stuff in bun.  
And also it allows the multiplayer server to go down without affecting the core website.  

## TODO

MP Screen  
- Create game  
- Join Game (lobby code should be small)  
- Leaderboard (ranking? elo?)  

Create game, maybe have some options?  
Join a lobby state of the game.  
Wait until another person has joined  
Once both are ready start match.  

*If both have left, remove lobby, or timeout of X minutes.  

Each Game round has a time limit, (set in lobby?, maybe dont allow ranking if options has been modified?)  
If both have guessed or the time limit ran out, show the result.  
And then wait like 10-20 seconds or skip if both parties agree.  

And then begin next round, and then after all rounds, "leave" game and just show end screen  

If anyone in the game leaves, disband the entire game and show an error.  
Only allow duels from origin adress defined in .env to try and prevent any external match things  

Elysia for request handler?  


## Route Design

- /get_lobbies
- /get_lobby/:id

