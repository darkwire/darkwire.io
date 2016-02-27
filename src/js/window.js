import FileHandler from './fileHandler';

export default class WindowHandler {
  constructor(darkwire, socket, chat) {
    this._isActive = false;
    this.fileHandler = new FileHandler(darkwire, socket, chat);
    this.socket = socket;
    this.chat = chat;
    this.keyMapping = [];

    this.newMessages = 0;
    this.favicon = new Favico({
      animation: 'pop',
      type: 'rectangle'
    });

    this.enableFileTransfer();
    this.bindEvents();
  }

  get isActive() {
    return this._isActive;
  }

  set isActive(active) {
    this._isActive = active;
    return this;
  }

  notifyFavicon() {
    this.newMessages++;
    this.favicon.badge(this.newMessages);
  }

  enableFileTransfer() {
    if (this.fileHandler.isSupported) {
      $('#send-file').click((e) => {
        e.preventDefault();
        $('#fileInput').trigger('click');
      });
    } else {
      $('#send-file').remove();
      $('#fileInput').remove();
    }
  }

  bindEvents() {
    window.onfocus = () => {
      this._isActive = true;
      this.newMessages = 0;
      this.favicon.reset();
    };

    window.onblur = () => {
      this._isActive = false;
    };

    // Keyboard events
    window.onkeydown = (event) => {
      // When the client hits ENTER on their keyboard and chat message input is focused
      if (event.which === 13 && !event.shiftKey && $('.inputMessage').is(':focus')) {
        handleMessageSending();
        this.socket.emit('stop typing');
        this.chat.typing = false;
        event.preventDefault();
      } else {
        this.keyMapping[event.keyCode] = event.type === 'keydown';
      }
    };

    window.onkeyup = (event) => {
      /**
       * 17: CTRL
       * 91: Left CMD
       * 93: Right CMD
       * 75: K
       */
      if ((this.keyMapping[17] || this.keyMapping[91] || this.keyMapping[93]) && this.keyMapping[75]) {
        this.chat.clear();
      }
      this.keyMapping = [];
    };

  }

}
