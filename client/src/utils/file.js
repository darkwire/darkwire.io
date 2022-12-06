export const getObjectUrl = (encodedFile, fileType) => {
  const b64 = unescape(encodedFile);
  const sliceSize = 1024;
  const byteCharacters = window.atob(b64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  if (byteArrays.length <= 0) {
    return '';
  }

  const blob = new window.Blob(byteArrays, { type: fileType });

  const url = window.URL.createObjectURL(blob);
  return url;
};
