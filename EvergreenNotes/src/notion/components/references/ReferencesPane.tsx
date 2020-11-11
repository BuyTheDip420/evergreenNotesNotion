/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useEffect, useState, Suspense } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';

import { Typography, makeStyles, createStyles, Theme } from '@material-ui/core';
import {
   currentPageSelector,
   referenceSelector,
   pageMarksSelector,
   sidebarExtensionSelector,
} from 'aNotion/providers/storeSelectors';
import { referenceActions } from 'aNotion/components/references/referenceSlice';
import { thunkStatus } from 'aNotion/types/thunkStatus';
import { AppPromiseDispatch } from 'aNotion/providers/appDispatch';
import { Reference } from './Reference';
import {
   ReferenceState,
   BacklinkRecordModel,
} from 'aNotion/components/references/referenceState';
import {
   NothingToFind,
   LoadingSection,
} from 'aNotion/components/common/Loading';
import { Backlink } from 'aNotion/components/references/Backlink';
import { PageMarkState } from 'aNotion/components/pageMarks/pageMarksState';
import { ErrorBoundary, ErrorFallback } from 'aCommon/Components/ErrorFallback';
import { useDebounce } from 'use-debounce/lib';
import { useDispatchWithSignal } from 'aNotion/hooks/useDispatchWithSignal';

const useStyles = makeStyles(() =>
   createStyles({
      sections: {
         marginLeft: 6,
         marginTop: 36,
         marginBottom: 12,
         fontVariant: 'small-caps',
      },
   })
);

// comment
export const ReferencesPane = () => {
   const dispatch: AppPromiseDispatch<any> = useDispatch();
   const currentPage = useSelector(currentPageSelector, shallowEqual);
   const sidebar = useSelector(sidebarExtensionSelector, shallowEqual);
   const references = useSelector(referenceSelector, shallowEqual);
   const marks = useSelector(pageMarksSelector, shallowEqual);

   const pageName = currentPage.currentPageData?.pageBlock?.simpleTitle;
   const pageId = currentPage.currentPageData?.pageBlock?.blockId;
   const [debouncedPage] = useDebounce(
      { pageId, pageName, status: currentPage.status },
      500,
      { trailing: true }
   );

   useDispatchWithSignal(
      () =>
         debouncedPage?.status === thunkStatus.fulfilled &&
         debouncedPage?.pageId != null &&
         debouncedPage?.pageName != null,
      referenceActions.fetchRefsForPage({
         query: debouncedPage.pageId!,
         pageId: debouncedPage.pageName!,
      }),
      [dispatch, debouncedPage]
   );

   return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
         <Backlinks refs={references}></Backlinks>
         <Relations refs={references}></Relations>
         <PageMentions marks={marks}></PageMentions>
         <FullTitle refs={references}></FullTitle>
         <Related refs={references}></Related>
         {references.status === thunkStatus.rejected && (
            <div style={{ marginTop: 12 }}>😵 Couldn't load references</div>
         )}
      </ErrorBoundary>
   );
};
export default ReferencesPane;

const Backlinks = ({ refs }: { refs: ReferenceState }) => {
   let classes = useStyles();

   let backlinks = refs.pageReferences.backlinks;

   return (
      <Suspense fallback={LoadingSection}>
         {refs.status === thunkStatus.pending && (
            <LoadingSection></LoadingSection>
         )}
         {refs.status === thunkStatus.fulfilled && (
            <>
               <Typography className={classes.sections} variant="h5">
                  <b>Backlinks</b>
               </Typography>
               {backlinks.map((u) => {
                  return (
                     <Backlink
                        key={u.backlinkBlock.blockId}
                        backlink={u}></Backlink>
                  );
               })}
               {backlinks.length === 0 && <NothingToFind />}
            </>
         )}
      </Suspense>
   );
};

const Relations = ({ refs }: { refs: ReferenceState }) => {
   let classes = useStyles();

   let relations = refs.pageReferences.relations;

   return (
      <Suspense fallback={LoadingSection}>
         {refs.status === thunkStatus.pending && (
            <LoadingSection></LoadingSection>
         )}
         {refs.status === thunkStatus.fulfilled && relations.length !== 0 && (
            <>
               <Typography className={classes.sections} variant="h5">
                  <b>Database Relations</b>
               </Typography>
               {relations.map((u) => {
                  let link: BacklinkRecordModel = {
                     backlinkBlock: u,
                     path: [],
                  };
                  return <Backlink key={u.blockId} backlink={link}></Backlink>;
               })}
               {relations.length === 0 && <NothingToFind />}
            </>
         )}
      </Suspense>
   );
};

const PageMentions = ({ marks }: { marks: PageMarkState }) => {
   let classes = useStyles();

   let mentions = marks.pageMarks?.pageMentions ?? [];
   let status = marks.status;

   return (
      <Suspense fallback={LoadingSection}>
         {status === thunkStatus.pending && <LoadingSection></LoadingSection>}
         {status === thunkStatus.fulfilled && (
            <>
               <Typography className={classes.sections} variant="h5">
                  <b>Mentions in the Current Page</b>
               </Typography>
               {mentions.map((u) => {
                  let link: BacklinkRecordModel = {
                     backlinkBlock: u,
                     path: [],
                  };
                  return <Backlink key={u.blockId} backlink={link}></Backlink>;
               })}
               {mentions.length === 0 && <NothingToFind />}
            </>
         )}
      </Suspense>
   );
};

const FullTitle = ({ refs }: { refs: ReferenceState }) => {
   let classes = useStyles();

   let fullTitle = refs.pageReferences.references.fullTitle;

   return (
      <Suspense fallback={LoadingSection}>
         {refs.status === thunkStatus.pending && (
            <LoadingSection></LoadingSection>
         )}
         {refs.status === thunkStatus.fulfilled && (
            <>
               <Typography className={classes.sections} variant="h5">
                  <b>Unlinked References</b>
               </Typography>
               {fullTitle.map((u) => {
                  return <Reference key={u.id} refData={u}></Reference>;
               })}
               {fullTitle.length === 0 && <NothingToFind />}
            </>
         )}
      </Suspense>
   );
};

const Related = ({ refs }: { refs: ReferenceState }) => {
   let classes = useStyles();

   let data = refs.pageReferences.references.related;

   return (
      <Suspense fallback={LoadingSection}>
         {refs.status === thunkStatus.pending && (
            <LoadingSection></LoadingSection>
         )}
         {refs.status === thunkStatus.fulfilled && (
            <>
               <Typography className={classes.sections} variant="h5">
                  <b>Similar Notes</b>
               </Typography>
               {data.map((u) => {
                  return <Reference key={u.id} refData={u}></Reference>;
               })}
               {data.length === 0 && <NothingToFind />}
            </>
         )}
      </Suspense>
   );
};
