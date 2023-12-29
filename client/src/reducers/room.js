/* eslint-disable no-case-declarations */
import _ from 'lodash';

const initialState = {
  members: [
    // {
    //   username,
    //   publicKey
    // }
  ],
  id: '',
  isLocked: false,
};

const room = (state = initialState, action) => {
  switch (action.type) {
    case 'USER_EXIT':
      const memberPubKeys = action.payload.members.map(m => m.publicKey.n);
      return {
        ...state,
        members: state.members
          .filter(member => memberPubKeys.includes(member.publicKey.n))
          .map(member => {
            const thisMember = action.payload.members.find(mem => mem.publicKey.n === member.id);
            if (thisMember) {
              return {
                ...member,
                isOwner: thisMember.isOwner,
              };
            }
            return { ...member };
          }),
      };
    case 'RECEIVE_ENCRYPTED_MESSAGE_ADD_USER':
      return {
        ...state,
        members: state.members.map(member => {
          if (member.publicKey.n === action.payload.payload.publicKey.n) {
            return {
              ...member,
              username: action.payload.payload.username,
              isOwner: action.payload.payload.isOwner,
              id: action.payload.payload.publicKey.n,
            };
          }
          return member;
        }),
      };
    case 'CREATE_USER':
      return {
        ...state,
        members: [
          ...state.members,
          {
            username: action.payload.username,
            publicKey: action.payload.publicKey,
            id: action.payload.publicKey.n,
          },
        ],
      };
    case 'USER_ENTER':
      const members = _.uniqBy(action.payload.users, member => member.publicKey.n);

      return {
        ...state,
        id: action.payload.id,
        isLocked: Boolean(action.payload.isLocked),
        members: members.reduce((acc, user) => {
          const exists = state.members.find(m => m.publicKey.n === user.publicKey.n);
          if (exists) {
            return [
              ...acc,
              {
                ...user,
                ...exists,
              },
            ];
          }
          return [
            ...acc,
            {
              publicKey: user.publicKey,
              isOwner: user.isOwner,
              id: user.id,
            },
          ];
        }, []),
      };
    case 'TOGGLE_LOCK_ROOM':
      return {
        ...state,
        isLocked: !state.isLocked,
      };
    case 'RECEIVE_TOGGLE_LOCK_ROOM':
      return {
        ...state,
        isLocked: action.payload.locked,
      };
    case 'SEND_ENCRYPTED_MESSAGE_CHANGE_USERNAME':
      const newUsername = action.payload.newUsername;
      const userId = action.payload.id;
      return {
        ...state,
        members: state.members.map(member =>
          member.id === userId
            ? {
                ...member,
                username: newUsername,
              }
            : member,
        ),
      };
    case 'RECEIVE_ENCRYPTED_MESSAGE_CHANGE_USERNAME':
      const newUsername2 = action.payload.payload.newUsername;
      const userId2 = action.payload.payload.id;
      return {
        ...state,
        members: state.members.map(member =>
          member.id === userId2
            ? {
                ...member,
                username: newUsername2,
              }
            : member,
        ),
      };
    default:
      return state;
  }
};

export default room;
