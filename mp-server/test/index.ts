import { request_type } from "../../shared/MP";

const socket = new WebSocket(`ws://localhost:40402/ws/game`);
socket.onerror = (event) => {
    console.error(event);
}

console.log('Client started');

socket.onmessage = (event) => {
    console.log(event.data);
};

socket.onopen = () => {
    console.log('Client connected');

    socket.send(JSON.stringify({
        type: request_type.CREATE_GAME,
        player_id: "test",
        _payload: {
            panoramas: [
                { id: 1, coordinates: [0, 0] },
                { id: 2, coordinates: [0, 0] },
                { id: 3, coordinates: [0, 0] },
                { id: 4, coordinates: [0, 0] },
                { id: 5, coordinates: [0, 0] },
            ],
            visibility: "public"
        }
    }));
};

