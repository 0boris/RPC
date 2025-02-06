import express from 'express';
import WebSocket, { Server } from 'ws';
import http from 'http';

const app = express();
const server = http.createServer(app);
const wss = new Server({ server }); 

let clients: WebSocket[] = [];

app.use(express.json());

wss.on('connection', (ws: WebSocket) => {
    console.log('New client connected');
    clients.push(ws);

    ws.on('message', (message: WebSocket.Data) => {
        const messageStr = message instanceof Buffer ? message.toString() : message;
        console.log('Received WebSocket message:', messageStr);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clients = clients.filter(client => client !== ws);
    });
});

app.post('/sendData', (req, res) => {
    const data = req.body;

    console.log('Received HTTP data:', data);

    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data)); // Send as JSON string
        }
    });

    res.status(200).send('Data forwarded to WebSocket clients');
});

server.listen(8080, () => {
    console.log('HTTP & WebSocket server running on http://localhost:8080');
});
