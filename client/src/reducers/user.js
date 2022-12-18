import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    privateKey: {},
    publicKey: {},
    username: '',
    id: '',
  },
  reducers: {
    createUser: (state, action) => {
      const { privateKey, publicKey, username } = action.payload;
      state.privateKey = privateKey;
      state.publicKey = publicKey;
      state.username = username;
      state.id = publicKey.n;
    },
    changeUsername: (state, action) => {
      const { newUsername } = action.payload;
      state.username = newUsername;
    }
  },
})

export const { createUser,changeUsername } = userSlice.actions

export default userSlice.reducer