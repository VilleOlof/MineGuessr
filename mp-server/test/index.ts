const socket = new WebSocket(`ws://localhost:40402/ws`);
socket.onerror = (event) => {
    console.error(event);
}

console.log('Client started');

socket.onmessage = (event) => {
    console.log(event.data);
};

socket.onopen = () => {
    console.log('Client connected');
    socket.send('Hello from client!');
};

