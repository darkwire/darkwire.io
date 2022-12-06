import React from 'react';
import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import FileTransfer from '.';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Fake date
vi.spyOn(global.Date, 'now').mockImplementation(() => new Date('2020-03-14T11:01:58.135Z').valueOf());

describe('FileTransfer tests', () => {
  const { File } = window;

  beforeEach(() => {
    // Restore original
    window.File = File;
  });
  afterEach(() => {
    // Restore original
    window.File = File;
  });

  it('FileTransfer component is displaying', async () => {
    const { asFragment } = render(<FileTransfer sendEncryptedMessage={() => {}} />);

    expect(asFragment()).toMatchSnapshot();
  });

  // Skipped as broken in this component version. Should be fixed later.
  it.skip('FileTransfer component detect bad browser support', () => {
    const { asFragment } = render(<FileTransfer sendEncryptedMessage={() => {}} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('Try to send file', async done => {
    const sendEncryptedMessage = data => {
      try {
        expect(data).toMatchObject({
          payload: {
            encodedFile: 'dGV4dGZpbGU=',
            fileName: 'filename.png',
            fileType: 'text/plain',
            timestamp: 1584183718135,
          },
          type: 'SEND_FILE',
        });
        done();
      } catch (error) {
        done(error);
      }
    };

    render(<FileTransfer sendEncryptedMessage={sendEncryptedMessage} />);

    const input = screen.getByPlaceholderText('Choose a file...');

    const testFile = new File(['textfile'], 'filename.png', { type: 'text/plain' });

    // Fire change event
    fireEvent.change(input, { target: { files: [testFile] } });
  });

  it('Try to send no file', async () => {
    render(<FileTransfer sendEncryptedMessage={() => {}} />);

    const input = screen.getByPlaceholderText('Choose a file...');

    // Fire change event
    fireEvent.change(input, { target: { files: [] } });
  });

  it('Try to send unsupported file', async () => {
    window.alert = vi.fn();

    render(<FileTransfer sendEncryptedMessage={() => {}} />);

    const input = screen.getByPlaceholderText('Choose a file...');

    const testFile = new File(['textfile'], 'filename.fake', { type: 'text/plain' });

    // Create thange event with fake file
    const changeEvent = createEvent.change(input, { target: { files: [testFile] } });

    // Fire change event
    fireEvent(input, changeEvent);

    expect(window.alert).toHaveBeenCalledWith('File type not supported');
  });

  it('Try to send too big file', async () => {
    window.alert = vi.fn();

    render(<FileTransfer sendEncryptedMessage={() => {}} />);

    const input = screen.getByPlaceholderText('Choose a file...');

    var fileContent = new Uint8Array(4000001);

    const testFile = new File([fileContent], 'filename.png', { type: 'text/plain' });

    // Fire change event
    fireEvent.change(input, { target: { files: [testFile] } });

    expect(window.alert).toHaveBeenCalledWith('Max filesize is 4MB');
  });
});
