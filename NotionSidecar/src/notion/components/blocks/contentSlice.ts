import {
   createSlice,
   createAsyncThunk,
   CaseReducer,
   PayloadAction,
} from '@reduxjs/toolkit';
import {
   CookieData,
   SiteState,
   NavigationState,
} from 'aNotion/components/NotionSiteTypes';
import * as blockApi from 'aNotion/api/v3/blockApi';
import * as LoadPageChunk from 'aNotion/types/notionv3/notionRecordTypes';
import { thunkStatus } from 'aNotion/types/thunkStatus';
import { getBlockFromPageChunk } from 'aNotion/services/blockService';
import { extractNavigationData } from 'aNotion/services/notionSiteService';
import { NotionBlockModel } from 'aNotion/models/NotionBlock';
import { RecordState } from 'aNotion/components/blocks/contentTypes';
import { contentSelector } from 'aNotion/providers/storeSelectors';
import { RootState } from 'aNotion/providers/rootReducer';
import { loadPageChunk } from 'aNotion/api/v3/blockApi';
import { Satellite } from '@material-ui/icons';

const initialState: RecordState = {};

const fetchContent = createAsyncThunk(
   'notion/content',
   async (
      { blockId, contentIds }: { blockId: string; contentIds: string[] },
      thunkApi
   ) => {
      let state = contentSelector(
         thunkApi.getState() as RootState
      ) as RecordState;

      //if it gets inefficient, we can use contentIds and syncRecordValues
      return fetchContentIfNotInStore(state, blockId, thunkApi);
   }
);
const fetchContentIfNotInStore = async (
   state: RecordState,
   blockId: string,
   thunkApi: any
) => {
   let data = checkStateForContent(state, blockId);

   if (data?.status !== thunkStatus.fulfilled) {
      let result = await blockApi.loadPageChunk(blockId, 100, thunkApi.signal);
      if (result != null && !thunkApi.signal.aborted) {
         let block = getBlockFromPageChunk(result, blockId);
         return block.getContentNodes();
      }
   } else {
      return data.record;
   }
   return [];
};

const checkStateForContent = (state: RecordState, blockId: string) => {
   if (
      state[blockId] != null &&
      state[blockId].status === thunkStatus.fulfilled
   ) {
      return state[blockId];
   }
   return undefined;
};

const contentSlice = createSlice({
   name: 'contentSlice',
   initialState: initialState,
   reducers: {},
   extraReducers: {
      [fetchContent.fulfilled.toString()]: (state, action) => {
         const { blockId } = action.meta.arg;
         state[blockId] = {
            record: action.payload,
            status: thunkStatus.fulfilled,
         }; // = action.payload;
      },
      [fetchContent.pending.toString()]: (state, action) => {
         const { blockId } = action.meta.arg;
         let data = checkStateForContent(state, blockId);
         if (data?.status !== thunkStatus.fulfilled) {
            state[blockId] = {
               record: [],
               status: thunkStatus.pending,
            };
         }
      },
      [fetchContent.rejected.toString()]: (state, action) => {
         const { blockId } = action.meta.arg;
         let data = checkStateForContent(state, blockId);
         if (data?.status !== thunkStatus.fulfilled) {
            state[blockId] = {
               record: [],
               status: thunkStatus.rejected,
            };
         }
      },
   },
});

export const contentActions = {
   ...contentSlice.actions,
   fetchContent: fetchContent,
};
export const contentReducers = contentSlice.reducer;
