#!/usr/bin/env node

const argv = require('yargs')
  .option('port', {alias: 'p', type: 'number', default: 3000, description: 'Port to bind on'})
  .option('xterm.command', {type: 'string', default: 'sh', description: 'Default command run in xterm'})
  .argv;

const createServer = require("./index");

const params = {
  port: argv.p,
  xtermOptions: argv.xterm
}

createServer(params).start();
