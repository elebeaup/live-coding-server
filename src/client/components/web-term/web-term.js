import { FitAddon } from 'xterm-addon-fit';
import { Terminal } from 'xterm';
import { unsafeCSS, css, html, LitElement } from 'lit-element';
import styles from 'bundle-text:xterm/css/xterm.css';

const Command = {
  OUTPUT: '0',
  SET_WINDOW_TITLE: '1',
  SET_PREFERENCES: '2',
  INPUT: '0',
  RESIZE_TERMINAL: '1'
};

class WebTerm extends LitElement {

  static get styles() {
    return [
      css`
        :host {
          display:block;
        }

        #terminal-container {
          height: 100%;
          background-color: rgb(11,40,50);
        }
      `,
      css`${unsafeCSS(styles)}`
    ];
  }

  constructor() {
    super();
    this.textEncoder = new TextEncoder();
    this.textDecoder = new TextDecoder();
    this.fitAddon = new FitAddon();
  }

  render() {
    return html`<div id="terminal-container"></div>`;
  }

  firstUpdated() {
    this.openTerminal();
    this.connect();
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  openTerminal() {
    this.terminal = new Terminal();
    const { fitAddon, terminal } = this;
    terminal.loadAddon(fitAddon);
    terminal.open(this.shadowRoot.getElementById('terminal-container'));
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
    setTimeout(() => this.fitAddon.fit(), 250);
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