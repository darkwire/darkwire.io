export default class AudoHandler {
  constructor() {
    this.beep = new Audio('beep.mp3');
    this._soundEnabled = true;
  }

  get soundEnabled() {
    return this._soundEnabled;
  }

  set soundEnabled(state) {
    if (state) {
      this._soundEnabled = state;
    }
    return this;
  }

  play() {
    this.beep.play();
  }
}
