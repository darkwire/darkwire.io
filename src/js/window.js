import FileHandler from './fileHandler';

export default class WindowHandler {
  constructor() {
    this._isActive = false;
    this.fileHandler = new FileHandler();

    this.newMessages = 0;
    this.favicon = new Favico({
      animation:'pop',
      type : 'rectangle'
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
  }

}
