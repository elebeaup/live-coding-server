import { FitAddon } from '../../../web_modules/xterm-addon-fit.js';
import Terminal from '../../../web_modules/xterm.js';
import { html, LitElement } from '../../../web_modules/lit-element.js';

const Command = {
  OUTPUT: '0',
  SET_WINDOW_TITLE: '1',
  SET_PREFERENCES: '2',
  INPUT: '0',
  RESIZE_TERMINAL: '1'
};

class WebTerm extends LitElement {
  constructor() {
    super();
    this.textEncoder = new TextEncoder();
    this.textDecoder = new TextDecoder();
    this.fitAddon = new FitAddon();
  }

  render() {
    return html`
      <link href="/web_modules/xterm/css/xterm.css" rel="stylesheet">
      <div id="terminal-container"></div>
    `;
  }

  firstUpdated() {
    this.openTerminal();
    this.connect();
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  openTerminal() {
    this.terminal = new Terminal.Terminal();
    const { fitAddon, terminal } = this;
    terminal.loadAddon(fitAddon);
    terminal.open(this.shadowRoot.getElementById('terminal-container'));
    fitAddon.fit();
    terminal.onData(this.onTerminalData.bind(this));
    terminal.onResize(this.onTerminalResize.bind(this));
  }

  connect() {
    this.socket = new WebSocket('ws://localhost:3000/xterm');
    const { socket } = this;
    socket.binaryType = 'arraybuffer';
    socket.addEventListener('open', this.onSocketOpen.bind(this));
    socket.addEventListener('message', this.onSocketData.bind(this));
  }

  onTerminalData(data) {
    const { socket, textEncoder } = this;
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(textEncoder.encode(Command.INPUT + data));
    }
  }

  onTerminalResize({ cols: columns, rows }) {
    const { socket, textEncoder } = this;
    if (socket.readyState === WebSocket.OPEN) {
      const msg = JSON.stringify({
        columns,
        rows
      });
      socket.send(textEncoder.encode(Command.RESIZE_TERMINAL + msg));
    }
  }

  onSocketOpen() {
  }

  onSocketData() {
    const { terminal, textDecoder, textEncoder } = this;
    const rawData = textDecoder.decode(event.data);
    const cmd = rawData[0];
    const data = rawData.slice(1);
    switch (cmd) {
      case Command.SET_PREFERENCES: {
        const preferences = JSON.parse(data);
        Object.keys(preferences).forEach((key) => {
          terminal.setOption(key, preferences[key]);
        });
        break;
      }
      case Command.OUTPUT: {
        terminal.write(textEncoder.encode(data));
        break;
      }
    }
  }

  onWindowResize() {
    this.fitAddon.fit();
  }
}

customElements.define('web-term', WebTerm);