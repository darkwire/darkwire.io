const initialState = {
  items: [],
};

const activities = (state = initialState, action) => {
  switch (action.type) {
    case 'CLEAR_ACTIVITIES':
      return {
        ...state,
        items: [],
      };
    case 'SEND_ENCRYPTED_MESSAGE_SLASH_COMMAND':
      return {
        ...state,
        items: [
          ...state.items,
          {
            ...action.payload,
            type: 'SLASH_COMMAND',
          },
        ],
      };
    case 'SEND_ENCRYPTED_MESSAGE_FILE_TRANSFER':
      return {
        ...state,
        items: [
          ...state.items,
          {
            ...action.payload,
            type: 'FILE',
          },
        ],
      };
    case 'SEND_ENCRYPTED_MESSAGE_TEXT_MESSAGE':
      return {
        ...state,
        items: [
          ...state.items,
          {
            ...action.payload,
            type: 'TEXT_MESSAGE',
          },
        ],
      };
    case 'RECEIVE_ENCRYPTED_MESSAGE_TEXT_MESSAGE':
      return {
        ...state,
        items: [
          ...state.items,
          {
            ...action.payload.payload,
            type: 'TEXT_MESSAGE',
          },
        ],
      };
    case 'SEND_ENCRYPTED_MESSAGE_SEND_FILE':
      return {
        ...state,
        items: [
          ...state.items,
          {
            ...action.payload,
            type: 'SEND_FILE',
          },
        ],
      };
    case 'RECEIVE_ENCRYPTED_MESSAGE_SEND_FILE':
      return {
        ...state,
        items: [
          ...state.items,
          {
            ...action.payload.payload,
            type: 'RECEIVE_FILE',
          },
        ],
      };
    case 'RECEIVE_ENCRYPTED_MESSAGE_ADD_USER':
      if (action.payload.state.room.members.find(m => m.id === action.payload.payload.id)) {
        return state;
      }

      return {
        ...state,
        items: [
          ...state.items,
          {
            userId: action.payload.payload.id,
            type: 'USER_ENTER',
            username: action.payload.payload.username,
          },
        ],
      };
    case 'USER_EXIT':
      if (!action.payload.id) {
        return state;
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            userId: action.payload.id,
            type: 'USER_EXIT',
            username: action.payload.username,
          },
        ],
      };
    case 'TOGGLE_LOCK_ROOM':
      return {
        ...state,
        items: [
          ...state.items,
          {
            username: action.payload.username,
            userId: action.payload.id,
            type: 'TOGGLE_LOCK_ROOM',
            locked: action.payload.locked,
            sender: action.payload.sender,
          },
        ],
      };
    case 'RECEIVE_TOGGLE_LOCK_ROOM':
      return {
        ...state,
        items: [
          ...state.items,
          {
            username: action.payload.username,
            userId: action.payload.id,
            type: 'TOGGLE_LOCK_ROOM',
            locked: action.payload.locked,
            sender: action.payload.sender,
          },
        ],
      };
    case 'SHOW_NOTICE':
      return {
        ...state,
        items: [
          ...state.items,
          {
            type: 'NOTICE',
            message: action.payload.message,
          },
        ],
      };
    case 'SEND_ENCRYPTED_MESSAGE_CHANGE_USERNAME':
      return {
        ...state,
        items: [
          ...state.items,
          {
            type: 'CHANGE_USERNAME',
            currentUsername: action.payload.currentUsername,
            newUsername: action.payload.newUsername,
          },
        ].map(item => {
          if (item.sender === action.payload.sender && item.type !== 'CHANGE_USERNAME') {
            return {
              ...item,
              username: action.payload.newUsername,
            };
          }
          return item;
        }),
      };
    case 'RECEIVE_ENCRYPTED_MESSAGE_CHANGE_USERNAME':
      return {
        ...state,
        items: [
          ...state.items,
          {
            type: 'CHANGE_USERNAME',
            currentUsername: action.payload.payload.currentUsername,
            newUsername: action.payload.payload.newUsername,
          },
        ].map(item => {
          if (['TEXT_MESSAGE', 'USER_ACTION'].includes(item.type) && item.sender === action.payload.payload.sender) {
            return {
              ...item,
              username: action.payload.payload.newUsername,
            };
          }
          return item;
        }),
      };
    case 'SEND_ENCRYPTED_MESSAGE_USER_ACTION':
      return {
        ...state,
        items: [
          ...state.items,
          {
            type: 'USER_ACTION',
            ...action.payload,
          },
        ],
      };
    case 'RECEIVE_ENCRYPTED_MESSAGE_USER_ACTION':
      return {
        ...state,
        items: [
          ...state.items,
          {
            type: 'USER_ACTION',
            ...action.payload.payload,
          },
        ],
      };
    default:
      return state;
  }
};

export default activities;
