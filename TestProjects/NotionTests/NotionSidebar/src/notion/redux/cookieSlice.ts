import {
   createSlice,
   createAsyncThunk,
   CaseReducer,
   PayloadAction,
} from '@reduxjs/toolkit';
import { CookieData } from '../types/CookieData';

const logPath = 'notion/cookies/';

// const saveCookieData = createAsyncThunk(
//    `${logPath}/getStore`,
//    async (data: CookieData) => {}
// );

type SliceState = { status: string; data?: CookieData | null };
const initialState: SliceState = { status: 'pending', data: null };

const save: CaseReducer<SliceState, PayloadAction<CookieData>> = (
   state,
   action
) => {
   state.data = action.payload;
};

// Then, handle actions in your reducers:
const cookieSlice = createSlice({
   name: 'locations',
   initialState: initialState,
   reducers: {
      save,
   },
   extraReducers: {
      // [saveCookieData.fulfilled.toString()]: (state, action) => {
      //    state.store = action.payload;
      // },
      // [saveCookieData.pending.toString()]: (state, action) => {
      //    state.store = {};
      // },
      // [saveCookieData.rejected.toString()]: (state, action) => {
      //    state.store = {};
      // },
   },
});

export const cookieActions = { ...cookieSlice.actions };
export const cookieReducers = {
   storeInfo: cookieSlice.reducer,
};