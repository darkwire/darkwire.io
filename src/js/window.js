export default class WindowHandler {
  constructor() {
    this._isActive = false;

    this.newMessages = 0;
    this.favicon = new Favico({
      animation:'pop',
      type : 'rectangle'
    });

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
