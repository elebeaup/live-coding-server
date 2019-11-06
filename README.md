# Live Coding Server

It is a small tool that helps you to code and run commands in slides

## Installation

```
$ git clone https://github.com/elebeaup/live-coding-server
$ cd live-coding-server
$ npm install
```

## Usage

```
npm start [-- [options] [<command>]]
```
By default, it starts a server at port 3000.

An useful example how to use this tool is available in the github repository [pulumi-presentation](https://github.com/elebeaup/pulumi-presentation).
The 10<sup>th</sup> shows a terminal based on [Xterm.js](https://github.com/xtermjs/xterm.js) that can be used to run any command and a web browser that auto refreses itself.

## Options

```
-p=NUMBER   - Port to listen (default: 3000)
-b=PATH     - Base directory (default: .)
```

## Credits

- [ttyd][1]: is used for the client side (index.html)
- [demoit][2]: is a tool that helps you create beautiful live-coding demonstrations

  [1]: https://github.com/tsl0922/ttyd
  [2]: https://github.com/dgageot/demoit