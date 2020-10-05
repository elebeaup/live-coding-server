const url = require('url');
const path = require('path');

const pty = require('node-pty');

const { Command } = require('../common/constants');
const { TextEncoder } = require('util');

const textEncoder = new TextEncoder();

const xtermOptions = {
  fontSize: 24,
  fontFamily: 'Inconsolata for Powerline,Consolas,monospace',
  theme: {
    background: 'rgb(11,40,50)',
    foreground: 'rgb(255, 255, 255)',
    cursor: '#073642',
    black: '#073642',
    blue: '#538bd0',
    green: '#859900',
    cyan: '#2aa198',
    red: '#dc322f',
    magenta: '#d33682',
    yellow: '#b58900',
    white: '#eee8d5',
    brightBlack: '#002b36',
    brightBlue: '#839496',
    brightGreen: '#586e75',
    brightCyan: '#93a1a1',
    brightRed: '#cb4b16',
    brightMagenta: '#6c71c4',
    brightYellow: '#657b83',
    brightWhite: '#fdf6e3'
  }
};

const processWsConnection = function(ws, req, { command = 'sh', basedir = '.' }) {
  // eslint-disable-next-line node/no-deprecated-api
  const { query } = url.parse(req.url, true);

  console.log(`${new Date()} Client ${req.connection.remoteAddress} started`);

  ws.send(textEncoder.encode(Command.SET_PREFERENCES + JSON.stringify(xtermOptions)));

  this.ptyProcess = pty.spawn(command, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: path.join(basedir, query.basedir || ''),
    env: process.env
  });

  console.log(`${new Date()} started process, pid: %s`, this.ptyProcess.pid);

  this.ptyProcess.on('data', (data) => {
    ws.send(textEncoder.encode(Command.OUTPUT + data));
  });

  this.ptyProcess.on('close', () => {
    console.log(`${new Date()} process exited %s with code %s`, this.ptyProcess.pid);
    ws.close();
  });

  ws.on('message', (message) => {
    const body = Buffer.from(message).toString();

    const cmd = body.substring(0, 1);

    switch (cmd) {
      case Command.RESIZE_TERMINAL: {
        const { columns, rows } = JSON.parse(body.substring(1));
        this.ptyProcess.resize(columns, rows);
        break;
      }

      case Command.INPUT: {
        this.ptyProcess.write(body.substring(1));
        break;
      }
    }
  });

  ws.on('close', () => {
    console.log(`${new Date()} WS closed`);
    this.ptyProcess.kill();
  });
};

module.exports.processWsConnection = processWsConnection;
