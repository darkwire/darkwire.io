export default class AudoHandler {
  constructor() {
    this._beep = window.Audio && new window.Audio('beep.mp3') || false;
    this._soundEnabled = true;
  }

  get soundEnabled() {
    return this._soundEnabled;
  }

  set soundEnabled(state) {
    this._soundEnabled = state;
    return this;
  }

  play() {
    if (this._beep && this.soundEnabled) {
      this._beep.play();
    }
    return this;
  }
}
