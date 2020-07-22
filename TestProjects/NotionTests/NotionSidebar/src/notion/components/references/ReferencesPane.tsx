import React, { useEffect, MouseEvent, useState } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';

import { Skeleton } from '@material-ui/lab';

import {
   Button,
   Dialog,
   List,
   ListItem,
   ListItemText,
   Typography,
   withStyles,
} from '@material-ui/core';
import {
   currentRecordSelector,
   referenceSelector,
} from 'aNotion/providers/rootReducer';
import { referenceActions } from './referenceSlice';
import {
   FetchTitleRefsParams,
   SearchSort,
} from 'aNotion/api/v3/SearchApiTypes';
import { thunkStatus } from 'aNotion/types/thunkStatus';
import { AppPromiseDispatch } from 'aNotion/providers/reduxStore';
import { Reference } from './Reference';

// comment
export const ReferencesPane = ({ status, data }: any) => {
   const dispatch: AppPromiseDispatch<any> = useDispatch();
   const record = useSelector(currentRecordSelector, shallowEqual);
   const references = useSelector(referenceSelector, shallowEqual);
   const pageName = record.pageRecord?.title;

   useEffect(() => {
      if (record.status === thunkStatus.fulfilled && pageName != null) {
         let p: FetchTitleRefsParams = {
            query: pageName,
            pageTitlesOnly: false,
            limit: 50,
            sort: SearchSort.Relevance,
         };
         const pr = dispatch(referenceActions.fetchTitleRefs(p));
         return () => {
            pr.abort();
         };
      } else if (record.status === thunkStatus.pending) {
      }
      return () => {};
   }, [record.status, dispatch, record.pageRecord, pageName]);

   return (
      <div style={{ height: '100%', width: '100%' }}>
         <React.Fragment>
            {references.status === thunkStatus.fulfilled &&
               references.pageReferences.direct.map((u) => {
                  return (
                     <Reference key={u.searchRecord.id} refData={u}></Reference>
                  );
               })}
         </React.Fragment>
         {references.status === thunkStatus.fulfilled &&
            references.pageReferences.fullTitle.map((u) => {
               return (
                  <Reference key={u.searchRecord.id} refData={u}></Reference>
               );
            })}
         {references.status === thunkStatus.fulfilled &&
            references.pageReferences.related.map((u) => {
               return (
                  <Reference key={u.searchRecord.id} refData={u}></Reference>
               );
            })}
         {references.status === thunkStatus.pending && (
            <div>
               <Skeleton />
               <Skeleton />
               <Skeleton />
               <Skeleton />
               <Skeleton />
            </div>
         )}
         {references.status === thunkStatus.rejected && <div>error!</div>}
      </div>
   );
};