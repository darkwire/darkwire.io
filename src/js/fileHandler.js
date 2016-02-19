export default class FileHandler {
  constructor(darkwire, socket) {
    if (window.File && window.FileReader && window.FileList && window.Blob && window.btoa) {
      this._isSupported = true;
      this.darkwire = darkwire;
      this.socket = socket;
      this.listen();
    } else {
      this._isSupported = false;
    }
  }

  get isSupported() {
    return this._isSupported;
  }

  encodeFile(event) {
    const file = event.target.files && event.target.files[0];

    if (file) {

      // let encodedFile = {
      //   fileName: file.name,
      //   fileSize: file.fileSize,
      //   base64: null
      // };

      // Support for only 1MB
      if (file.size > 1000000) {
        console.log(file);
        alert("Max filesize is 1MB.");
        return false;
      }

      const reader = new FileReader();

      reader.onload = (readerEvent) => {
        const base64 = window.btoa(readerEvent.target.result);
        this.darkwire.encodeMessage(base64, 'file').then( (socketData) => {
          this.socket.emit('new message', socketData);
        });
      }

      reader.readAsBinaryString(file);
    }

    return false;
  }

  listen() {
    // browser API
    document.getElementById('fileInput').addEventListener('change', jQuery.proxy(this.encodeFile, this), false);

    // darkwire
    
    return this;
  }
}
