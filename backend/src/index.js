import express from 'express';
import * as io from 'socket.io';
import path from 'path';
import http from 'http';
import bodyParser from 'body-parser';
import { routes } from './routes/index.js';
import { socketsOnConnectionHandler } from './socketsHandlers.js';

const port = Number(process.env.PORT || 4001);
const app = express();
//app.use(cors({ preflightContinue: true, origin: '*' }));
app.use(bodyParser.json());
app.use(routes);
app.use(express.static(path.join(__dirname, '..', 'build')));

const server = http.createServer(app);

const socketIo = new io.Server(server, {
  cors: {
    origin: '*',
    preflightContinue: true
  }
});

socketIo.on('connection', socketsOnConnectionHandler);

server.listen(port, () => console.log(`Listening on port ${ port }`));
