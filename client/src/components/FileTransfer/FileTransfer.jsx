import React from 'react';
import PropTypes from 'prop-types';
import { nanoid } from 'nanoid';
import { File } from 'react-feather';

import { MAX_FILE_SIZE } from '@/config/env';
import { sanitize } from '@/utils';

import classes from './styles.module.scss';

const VALID_FILE_TYPES = [
  'png',
  'jpg',
  'jpeg',
  'gif',
  'zip',
  'rar',
  'gzip',
  'pdf',
  'txt',
  'json',
  'doc',
  'docx',
  'csv',
  'js',
  'html',
  'css',
];

/**
 * Encode the given file to binary string
 * @param {File} file
 */
const encodeFile = file => {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();

    if (!file) {
      reject();
      return;
    }

    reader.onload = readerEvent => {
      resolve(window.btoa(readerEvent.target.result));
    };

    reader.readAsBinaryString(file);
  });
};

export const FileTransfer = ({ sendEncryptedMessage }) => {
  const fileInput = React.useRef(null);

  const supported = React.useMemo(
    () =>
      Boolean(window.File) &&
      Boolean(window.FileReader) &&
      Boolean(window.FileList) &&
      Boolean(window.Blob) &&
      Boolean(window.btoa) &&
      Boolean(window.atob) &&
      Boolean(window.URL),
    [],
  );

  React.useEffect(() => {
    const currentFileInput = fileInput.current;
    let isMounted = true;

    const handleFileTransfer = async event => {
      const file = event.target.files && event.target.files[0];

      if (file) {
        const fileType = file.type || 'file';
        const fileName = sanitize(file.name);
        const fileExtension = file.name.split('.').pop().toLowerCase();

        if (VALID_FILE_TYPES.indexOf(fileExtension) <= -1) {
          // eslint-disable-next-line no-alert
          alert('File type not supported');
          return false;
        }

        if (file.size > MAX_FILE_SIZE * 1000000) {
          // eslint-disable-next-line no-alert
          alert(`Max filesize is ${MAX_FILE_SIZE}MB`);
          return false;
        }

        const fileId = nanoid();
        const fileData = {
          id: fileId,
          file,
          fileName,
          fileType,
          encodedFile: await encodeFile(file),
        };

        // Mounted component guard
        if (!isMounted) {
          return;
        }

        fileInput.current.value = '';

        sendEncryptedMessage({
          type: 'SEND_FILE',
          payload: {
            fileName: fileData.fileName,
            encodedFile: fileData.encodedFile,
            fileType: fileData.fileType,
            timestamp: Date.now(),
          },
        });
      }

      return false;
    };

    currentFileInput.addEventListener('change', handleFileTransfer);

    return () => {
      isMounted = false;
      currentFileInput.removeEventListener('change', handleFileTransfer);
    };
  }, [sendEncryptedMessage]);

  if (!supported) {
    return null;
  }

  return (
    <div className={`${classes.styles} icon file-transfer btn btn-link`}>
      <input placeholder="Choose a file..." type="file" name="fileUploader" id="fileInput" ref={fileInput} />
      <label htmlFor="fileInput">
        <File color="#fff" />
      </label>
    </div>
  );
};

FileTransfer.propTypes = {
  sendEncryptedMessage: PropTypes.func.isRequired,
};

export default FileTransfer;
