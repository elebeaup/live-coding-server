#!/usr/bin/env node

const argv = require('yargs')
  .parserConfiguration({
    'dot-notation': false
  })
  .strict()
  .option('basedir', {alias: 'b', type: 'string', default: '.', description: 'Directory to serve static files from'})
  .option('port', {alias: 'p', type: 'number', default: 3000, description: 'Port to bind on'})
  .option('xterm.command', {type: 'string', default: 'sh', description: 'Default command run in xterm'})
  .argv;

const createServer = require("./index");

const params = {
  basedir: argv.b,
  port: argv.p,
  xtermOptions: {
    command: argv['xterm.command']
  }
};

createServer(params).start();
