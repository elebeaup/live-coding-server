const path = require('path');

const axios = require('axios');

const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');

const http = require('http');

const livereload = require('livereload');

const {processWsConnection} = require('./handlers');

function createServer(options) {
  return new LiveCodingServer(options);
};

class LiveCodingServer {
  constructor({port, basedir, xtermOptions = {}}) {
    this.port = port || 3000;
    this.basedir = basedir || './';
    this.xtermOptions = xtermOptions;
  }

  start() {
    const app = express();
    const basedir = this.basedir;
    const port = this.port;
    const xtermOptions = this.xtermOptions;

    app.use('/xterm', express.static(path.join(__dirname, '/xterm')));
    app.use(require('connect-livereload')());
    app.use('/', express.static(path.join(basedir, '/')));
    app.use(cors());

    const server = http.createServer(app);
    const wss = new WebSocket.Server({server});

    wss.on('connection', function (ws, req) {
      processWsConnection(ws, req, {
        command: xtermOptions.command,
        basedir
      });
    });

    app.head('/api/ping', function (req, res) {
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

    server.listen(port, function () {
      const lrserver = livereload.createServer();
      lrserver.watch(basedir);
      console.log(`Listening on http://localhost:${port}, serving ${basedir}`);
    });
  }
}

module.exports = createServer;
