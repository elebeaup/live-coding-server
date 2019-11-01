const path = require('path');

const express = require('express');
const WebSocket = require('ws');
const urlExists = require('url-exists');
const cors = require('cors');

const { createServer } = require('http');
const argv = require('yargs').argv;

const { processWsConnection } = require('./handlers');

const app = express();
app.use('/xterm', express.static(path.join(__dirname, '/public')));
app.use(cors());

const server = createServer(app);
const wss = new WebSocket.Server({ server });
const port = argv.p || 3000;

wss.on('connection', function(ws, req) {
  processWsConnection(ws, req, {
    command: argv._[0],
    basedir: argv.b
  });
});

app.head('/api/ping', function(req, res) {
  const url = req.query.url;
  console.log(`${new Date()} pinging ${url}`);

  urlExists(url, (err, exists) => {
    if (!exists) {
      res.status(404);
    } else {
      res.status(200);
    }

    res.end();
  });
});

server.listen(port, function() {
  console.log(`Listening on http://localhost:${port}`);
});
