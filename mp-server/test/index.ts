import * as THREE from "three";
import { Payloads, request_type } from "../../shared/MP";
import readline from 'readline';
import { GameModule } from "../../shared";

let user_id = "test";
let game_id: string;

const socket = new WebSocket(`ws://localhost:40402`);
socket.onerror = (event) => {
    console.error(event);
}

console.log('Client started');

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
        case 2: {
            game_id = data.payload.game_id;
            console.log(`Joined game: ${game_id}`);
            break;
        }
        case 3: {
            console.log("played joined: ", data.payload.player_id);

            break;
        }
        case 5: {
            console.log("player ready: ", data.payload.player_id);
            break;
        }
        case 6: {
            const panorama_id = data.payload.panorama_id;
            const round_index = data.payload.round_index;
            console.log(`Started next round [${round_index + 1}] with panorama: ${panorama_id}`)

            break;
        }
        case 8: {
            console.log("Player guessed: ", data.payload.player_id);
            break;
        }
        case 9: {
            console.log("Round ended");
            for (const [player_id, round] of Object.entries(data.payload.rounds as { [key: string]: GameModule.Round })) {
                console.log(`Player ${player_id} guessed: ${round.guess_location.x}, ${round.guess_location.y} with a distance of ${Math.floor(round.distance)} meters. Score: ${round.score}`);
            }

            break;
        }
        case 11: {
            console.log("Game finished");
            for (const [player_id, rounds] of Object.entries(data.payload.players as { [key: string]: GameModule.Round[] })) {
                console.log(`Player ${player_id} finished with a total score of ${rounds.reduce((acc, round) => acc + round.score, 0)}`);
            }

            break;
        }
        case 13: {
            console.error("Error: ", data.payload);
            break;
        }
        case 14: {
            // Ping
            break;
        }
        default: {
            console.log(`Unhandled message: ${data.type}`)
        }
    }
};

socket.onclose = () => {
    socket.send(JSON.stringify({
        type: request_type.ABORTED,
        player_id: user_id,
        _payload: {
            reason: "Client closed"
        } as Payloads.Aborted
    }));
}

socket.onopen = () => {
    console.log('Client connected');

    setTimeout(() => {
        socket.send(JSON.stringify({
            type: request_type.PING,
            player_id: user_id,
            _payload: {}
        }));
    }, 1000 * 5);

    rl.question('Enter your name: ', (name) => {
        user_id = name;
        console.log(`Welcome ${user_id}`);
        menu();
    });
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function menu() {
    const menu_item = (text: string, desc: string) => console.log(`\x1b[1;36m${text}\x1b[1;0m - \x1b[1;37m${desc}\x1b[1;0m`);

    console.log('\x1b[1;32m:: Menu ::\x1b[1;0m');
    menu_item('create', 'Create a game');
    menu_item('join', 'Join a game');
    menu_item('ready', 'Ready up');
    menu_item('guess', 'Guess the location');
    menu_item('next', 'Go to the next round');

    menu_item('exit', 'Exit the client');

    console.log('\x1b[1;90m:: ---- ::\x1b[1;0m');
}

rl.on('line', (input) => {
    let write_menu = true;

    switch (input) {
        case "create": {
            socket.send(JSON.stringify({
                type: request_type.CREATE_GAME,
                player_id: user_id,
                _payload: {
                    panoramas: [
                        { id: 1, coordinates: [1, 0] },
                        { id: 2, coordinates: [0, 1] },
                        { id: 3, coordinates: [1, 1] },
                        { id: 4, coordinates: [1, 2] },
                        { id: 5, coordinates: [2, 1] },
                    ],
                    visibility: "public"
                } as Payloads.CreateGame
            }));

            break;
        }
        case "join": {
            write_menu = false;
            rl.question('Game ID: ', (game_id) => {
                console.log(`Joining game ${game_id}`);
                socket.send(JSON.stringify({
                    type: request_type.JOIN_GAME,
                    player_id: user_id,
                    _payload: {
                        game_id
                    } as Payloads.JoinGame
                }));

                menu();
            });

            break;
        }
        case "ready": {
            socket.send(JSON.stringify({
                type: request_type.CHANGE_READY_STATUS,
                player_id: user_id,
                _payload: {
                    ready: true
                } as Payloads.ChangeReadyStatus,
                game_id
            }));

            break;
        }
        case "guess": {
            const [x, z] = [Math.ceil(Math.random() * 2000), Math.ceil(Math.random() * 2000)];

            socket.send(JSON.stringify({
                type: request_type.GUESS_LOCATION,
                player_id: user_id,
                _payload: {
                    location: new THREE.Vector2(x, z)
                } as Payloads.GuessLocation,
                game_id
            }));

            break;
        }
        case "next": {
            socket.send(JSON.stringify({
                type: request_type.GOTO_NEXT_ROUND,
                player_id: user_id,
                game_id
            }));

            break;
        }
        case "exit": {
            socket.close();
            process.exit(0);
        }
    }

    if (write_menu) menu();
});
