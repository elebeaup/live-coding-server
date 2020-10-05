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
npm start [-- [options]]
```
By default, it starts a server at port 3000.

## Options

```
-b, --basedir=PATH  - Directory to serve static files from (default: .)
-p, --port=NUMBER   - Port to listen (default: 3000)
--xterm.command     - Default command run in xterm (default: sh)
```

## Demo

```
npm run lcs-demo
```

Then, open the URL on your web browser and you can see the default shell running in the browser.

## Credits

- [ttyd][1]: is a tool for sharing terminal over the web
- [demoit][2]: is a tool that helps you create beautiful live-coding demonstrations

  [1]: https://github.com/tsl0922/ttyd
  [2]: https://github.com/dgageot/demoit
