const path = require('path');

const axios = require('axios');

const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');

const { createServer } = require('http');
const argv = require('yargs').argv;

const livereload = require('livereload');

const { processWsConnection } = require('./handlers');

const basedir = argv.b || './';
const app = express();
app.use('/xterm', express.static(path.join(__dirname, '/xterm')));
app.use(require('connect-livereload')());
app.use('/', express.static(path.join(basedir, '/')));
app.use(cors());

const server = createServer(app);
const wss = new WebSocket.Server({ server });
const port = argv.p || 3000;

wss.on('connection', function(ws, req) {
  processWsConnection(ws, req, {
    command: argv._[0],
    basedir
  });
});

app.head('/api/ping', function(req, res) {
  const url = req.query.url;
  console.log(`${new Date()} pinging ${url}`);

  axios.head(url)
    .then((response) => {
      res.status(200);
    })
    .catch((error) => {
      res.status(404);
    })
    .then(() => {
      res.end();
    });
});

server.listen(port, function() {
  const lrserver = livereload.createServer();
  lrserver.watch(basedir);
  console.log(`Listening on http://localhost:${port}, serving ${basedir}`);
});

