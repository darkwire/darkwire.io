import { describe, it, expect } from 'vitest';

import reducer from './activities';

describe('Activities reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      items: [],
    });
  });

  it('should handle CLEAR_ACTVITIES', () => {
    expect(reducer({ items: [{}, {}] }, { type: 'CLEAR_ACTIVITIES' })).toEqual({
      items: [],
    });
  });

  it('should handle SEND_ENCRYPTED_MESSAGE_SLASH_COMMAND', () => {
    expect(
      reducer({ items: [] }, { type: 'SEND_ENCRYPTED_MESSAGE_SLASH_COMMAND', payload: { payload: 'content' } }),
    ).toEqual({ items: [{ payload: 'content', type: 'SLASH_COMMAND' }] });
  });

  it('should handle SEND_ENCRYPTED_MESSAGE_FILE_TRANSFER', () => {
    expect(
      reducer({ items: [] }, { type: 'SEND_ENCRYPTED_MESSAGE_FILE_TRANSFER', payload: { payload: 'content' } }),
    ).toEqual({ items: [{ payload: 'content', type: 'FILE' }] });
  });

  it('should handle SEND_ENCRYPTED_MESSAGE_TEXT_MESSAGE', () => {
    expect(
      reducer({ items: [] }, { type: 'SEND_ENCRYPTED_MESSAGE_TEXT_MESSAGE', payload: { payload: 'content' } }),
    ).toEqual({ items: [{ payload: 'content', type: 'TEXT_MESSAGE' }] });
  });

  it('should handle RECEIVE_ENCRYPTED_MESSAGE_TEXT_MESSAGE', () => {
    expect(
      reducer(
        { items: [] },
        { type: 'RECEIVE_ENCRYPTED_MESSAGE_TEXT_MESSAGE', payload: { payload: { payload: 'content' } } },
      ),
    ).toEqual({ items: [{ payload: 'content', type: 'TEXT_MESSAGE' }] });
  });

  it('should handle SEND_ENCRYPTED_MESSAGE_SEND_FILE', () => {
    expect(
      reducer({ items: [] }, { type: 'SEND_ENCRYPTED_MESSAGE_SEND_FILE', payload: { payload: 'content' } }),
    ).toEqual({ items: [{ payload: 'content', type: 'SEND_FILE' }] });
  });

  it('should handle RECEIVE_ENCRYPTED_MESSAGE_SEND_FILE', () => {
    expect(
      reducer(
        { items: [] },
        { type: 'RECEIVE_ENCRYPTED_MESSAGE_SEND_FILE', payload: { payload: { message: 'content' } } },
      ),
    ).toEqual({ items: [{ message: 'content', type: 'RECEIVE_FILE' }] });
  });

  it('should handle RECEIVE_ENCRYPTED_MESSAGE_ADD_USER', () => {
    const payload1 = {
      payload: { content: 'content', id: 'idalan', username: 'alan' },
      state: {
        room: {
          members: [{ id: 'iddan' }],
        },
      },
    };
    expect(reducer({ items: [] }, { type: 'RECEIVE_ENCRYPTED_MESSAGE_ADD_USER', payload: payload1 })).toEqual({
      items: [{ type: 'USER_ENTER', userId: 'idalan', username: 'alan' }],
    });

    // Test already reveived user
    const payload2 = {
      payload: { content: 'content', id: 'idalan', username: 'alan' },
      state: {
        room: {
          members: [{ id: 'idalan' }],
        },
      },
    };
    expect(reducer({ items: [] }, { type: 'RECEIVE_ENCRYPTED_MESSAGE_ADD_USER', payload: payload2 })).toEqual({
      items: [],
    });
  });

  it('should handle USER_EXIT', () => {
    expect(reducer({ items: [] }, { type: 'USER_EXIT', payload: { id: 'idalan', username: 'alan' } })).toEqual({
      items: [{ type: 'USER_EXIT', userId: 'idalan', username: 'alan' }],
    });
    // Without id
    expect(reducer({ items: [] }, { type: 'USER_EXIT', payload: { username: 'alan' } })).toEqual({
      items: [],
    });
  });

  it('should handle TOGGLE_LOCK_ROOM', () => {
    expect(
      reducer(
        { items: [] },
        { type: 'TOGGLE_LOCK_ROOM', payload: { id: 'idalan', username: 'alan', locked: true, sender: 'alan' } },
      ),
    ).toEqual({
      items: [{ locked: true, sender: 'alan', type: 'TOGGLE_LOCK_ROOM', userId: 'idalan', username: 'alan' }],
    });
  });

  it('should handle RECEIVE_TOGGLE_LOCK_ROOM', () => {
    expect(
      reducer(
        { items: [] },
        { type: 'RECEIVE_TOGGLE_LOCK_ROOM', payload: { id: 'idalan', username: 'alan', locked: true, sender: 'alan' } },
      ),
    ).toEqual({
      items: [{ locked: true, sender: 'alan', type: 'TOGGLE_LOCK_ROOM', userId: 'idalan', username: 'alan' }],
    });
  });

  it('should handle SHOW_NOTICE', () => {
    expect(reducer({ items: [] }, { type: 'SHOW_NOTICE', payload: { message: 'Hello wordld!' } })).toEqual({
      items: [{ message: 'Hello wordld!', type: 'NOTICE' }],
    });
  });

  it('should handle SEND_ENCRYPTED_MESSAGE_CHANGE_USERNAME', () => {
    const payload1 = { currentUsername: 'alan', newUsername: 'dan', sender: 'alan' };
    expect(
      reducer(
        {
          items: [
            { sender: 'alan', username: 'alan' },
            { sender: 'alice', username: 'alice' },
          ],
        },
        { type: 'SEND_ENCRYPTED_MESSAGE_CHANGE_USERNAME', payload: payload1 },
      ),
    ).toEqual({
      items: [
        { sender: 'alan', username: 'dan' },
        { sender: 'alice', username: 'alice' },
        { currentUsername: 'alan', newUsername: 'dan', type: 'CHANGE_USERNAME' },
      ],
    });
  });

  it('should handle RECEIVE_ENCRYPTED_MESSAGE_CHANGE_USERNAME', () => {
    const payload1 = { payload: { currentUsername: 'alan', newUsername: 'dan', sender: 'alan' } };
    expect(
      reducer(
        {
          items: [
            { sender: 'alan', username: 'alan', type: 'USER_ACTION' },
            { sender: 'alan', username: 'alan', type: 'TEXT_MESSAGE' },
            { sender: 'alan', username: 'alan', type: 'ANOTHER_TYPE' },
            { sender: 'alice', username: 'alice' },
          ],
        },
        { type: 'RECEIVE_ENCRYPTED_MESSAGE_CHANGE_USERNAME', payload: payload1 },
      ),
    ).toEqual({
      items: [
        { sender: 'alan', type: 'USER_ACTION', username: 'dan' },
        { sender: 'alan', type: 'TEXT_MESSAGE', username: 'dan' },
        { sender: 'alan', type: 'ANOTHER_TYPE', username: 'alan' },
        { sender: 'alice', username: 'alice' },
        { currentUsername: 'alan', newUsername: 'dan', type: 'CHANGE_USERNAME' },
      ],
    });
  });

  it('should handle SEND_ENCRYPTED_MESSAGE_USER_ACTION', () => {
    expect(
      reducer({ items: [] }, { type: 'SEND_ENCRYPTED_MESSAGE_USER_ACTION', payload: { message: 'Hello wordld!' } }),
    ).toEqual({ items: [{ message: 'Hello wordld!', type: 'USER_ACTION' }] });
  });

  it('should handle RECEIVE_ENCRYPTED_MESSAGE_USER_ACTION', () => {
    expect(
      reducer(
        { items: [] },
        { type: 'RECEIVE_ENCRYPTED_MESSAGE_USER_ACTION', payload: { payload: { message: 'Hello wordld!' } } },
      ),
    ).toEqual({ items: [{ message: 'Hello wordld!', type: 'USER_ACTION' }] });
  });
});
