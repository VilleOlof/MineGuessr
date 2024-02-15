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

function send_message(type: request_type, payload: any) {
    socket.send(JSON.stringify({
        type,
        player_id: user_id,
        _payload: payload,
        game_id: game_id,
        auth_session: "awf093j8ps8izzbropevxtxscqlicmo3perr1b4f"
    }));
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
        case 12: {
            console.error("Aborted: ", data.payload.reason);
            break;
        }
        case 13: {
            console.error("Error: ", data.payload.reason);
            break;
        }
        case 14: {
            // Ping
            break;
        }
        case 15: {
            console.log(`You have ${data.payload.time / 1000} seconds to guess the location`);
            break;
        }
        case 16: {
            console.log(`You have ${data.payload.time / 1000} seconds to go to the next round`);
            break;
        }
        case 18: {
            console.log(`Player left: ${data.payload.player_id}`);
            break;
        }
        default: {
            console.log(`Unhandled message: ${data.type}`)
        }
    }
};

socket.onclose = () => {
    send_message(
        request_type.ABORTED,
        { reason: "Client closed" } as Payloads.Aborted
    );

    process.exit(0);
}

socket.onopen = () => {
    console.log('Client connected');

    const ping = () => {
        send_message(request_type.PING, {});
    }

    rl.question('Enter your name: ', (name) => {
        user_id = name;
        console.log(`Welcome ${user_id}`);

        ping(); // First init verify auth
        setInterval(ping, 1000 * 5);

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
    menu_item('leave', 'Leave a game');
    menu_item('ready', 'Ready up');
    menu_item('guess', 'Guess the location');
    menu_item('next', 'Go to the next round');

    menu_item('exit', 'Exit the client');

    console.log('\x1b[1;90m:: ---- ::\x1b[1;0m');
}

rl.on('line', (input) => {
    let write_menu = true;

    switch (input) {
        case "c": { }
        case "create": {
            send_message(
                request_type.CREATE_GAME,
                {
                    panoramas: [
                        { id: 1, coordinates: [1, 0] },
                        { id: 2, coordinates: [0, 1] },
                        { id: 3, coordinates: [1, 1] },
                        { id: 4, coordinates: [1, 2] },
                        { id: 5, coordinates: [2, 1] },
                    ],
                    visibility: "public"
                } as Payloads.CreateGame
            )

            break;
        }
        case "j": { }
        case "join": {
            write_menu = false;
            rl.question('Game ID: ', (game_id) => {
                console.log(`Joining game ${game_id}`);
                send_message(
                    request_type.JOIN_GAME,
                    { game_id } as Payloads.JoinGame
                );

                menu();
            });

            break;
        }
        case "l": { }
        case "leave": {
            send_message(
                request_type.LEAVE_GAME,
                {}
            );

            break;
        }
        case "r": { }
        case "ready": {
            send_message(
                request_type.CHANGE_READY_STATUS,
                { ready: true } as Payloads.ChangeReadyStatus
            );

            break;
        }
        case "g": { }
        case "guess": {
            const [x, z] = [Math.ceil(Math.random() * 2000), Math.ceil(Math.random() * 2000)];

            send_message(
                request_type.GUESS_LOCATION,
                {
                    location: new THREE.Vector2(x, z)
                } as Payloads.GuessLocation
            );

            break;
        }
        case "n": { }
        case "next": {
            send_message(
                request_type.GOTO_NEXT_ROUND,
                {}
            );

            break;
        }
        case "e": { }
        case "exit": {
            socket.close();
            process.exit(0);
        }
    }

    if (write_menu) menu();
});
