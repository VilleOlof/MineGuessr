import { Payloads, request_type } from "../../shared/MP";
import readline from 'readline';

let user_id = "test";
let game_id: string;

const socket = new WebSocket(`ws://localhost:40402`);
socket.onerror = (event) => {
    console.error(event);
}

console.log('Client started');

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data.type);

    switch (data.type) {
        case 2: {
            game_id = data.payload.game_id;
            console.log(`Joined game: ${game_id}`);
            break;
        }
        case 3: {
            console.log("played joined: ", data.payload.player_id);
        }
        case 5: {
            console.log("player ready: ", data.payload.player_id);
            break;
        }
        case 13: {
            console.error("Error: ", data.payload);
            break;
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
        case "exit": {
            socket.close();
            process.exit(0);
        }
    }

    if (write_menu) menu();
});
