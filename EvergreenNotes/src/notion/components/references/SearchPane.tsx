/* eslint-disable jsx-a11y/accessible-emoji */
import React, {
   useEffect,
   MouseEvent,
   useState,
   SyntheticEvent,
   Suspense,
   useMemo,
} from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';

import {
   Typography,
   makeStyles,
   createStyles,
   Theme,
   TextField,
   Popover,
   Grid,
   IconButton,
   ListItem,
   List,
   ListItemText,
} from '@material-ui/core';
import {
   currentPageSelector,
   referenceSelector,
} from 'aNotion/providers/rootSelectors';
import { referenceActions } from 'aNotion/components/references/referenceSlice';
import { thunkStatus } from 'aNotion/types/thunkStatus';
import {
   TAppDispatchWithPromise,
   getAppState,
} from 'aNotion/providers/appDispatch';
import { Reference } from 'aNotion/components/references/Reference';
import {
   SearchReferences,
   defaultSearchReferences,
} from 'aNotion/components/references/referenceState';
import { NothingToFind, LoadingSection } from '../common/Loading';
import { useApi, TUseApiPromise } from 'aNotion/hooks/useApi';
import { searchNotion } from 'aNotion/services/referenceService';
import {
   usePopupState,
   bindToggle,
   bindPopover,
} from 'material-ui-popup-state/hooks';
import HistoryIcon from '@material-ui/icons/History';
import { ErrorBoundary, ErrorFallback } from 'aCommon/Components/ErrorFallback';

const useStyles = makeStyles((theme: Theme) =>
   createStyles({
      sections: {
         marginLeft: 6,
         marginTop: 36,
         marginBottom: 12,
         fontVariant: 'small-caps',
      },
      recentSearches: {
         margin: 6,
         padding: 6,
         minWidth: 250,
         maxWidth: 290,
         backgroundColor: theme.palette.layoutBackground.main,
      },
   })
);
const search: TUseApiPromise<SearchReferences, string> = (
   query: string | undefined
): [Promise<SearchReferences>, AbortController] => {
   let spaceId = getAppState(currentPageSelector).currentPageData?.spaceId;

   if (spaceId != null) {
      const ab = new AbortController();
      let result = searchNotion(query ?? '', spaceId, ab);
      return [result, ab];
   }
   return [
      new Promise<SearchReferences>(() => defaultSearchReferences()),
      new AbortController(),
   ];
};

// comment
export const SearchPane = () => {
   const dispatch: TAppDispatchWithPromise<any> = useDispatch();
   const classes = useStyles();

   const { searchQueries } = useSelector(referenceSelector, shallowEqual);
   const [text, setText] = useState<string>('');

   let [status, result, setSearchText, currentSearchText] = useApi<
      SearchReferences,
      string
   >(search);

   const popupState = usePopupState({
      variant: 'popper',
      popupId: 'searchPopper',
   });

   const handleTextChanged = (e: any) => {
      let text = e.target.value;
      setSearchText(text);
      setText(text);
   };

   const handleKeyDown = (event: any) => {
      let text = event.target.value;

      if (event.keyCode === 13) {
         setSearchText(text);
         setText(text);
      }
   };

   useEffect(() => {
      if (status === thunkStatus.fulfilled && currentSearchText != null) {
         dispatch(referenceActions.addSearchQueries(currentSearchText));
      }
   }, [status, currentSearchText, dispatch]);

   result = result ?? defaultSearchReferences();

   const searchQueriesMemo = useMemo(
      () =>
         searchQueries.map((s) => {
            const handleHistoryClick = (e: any) => {
               setSearchText(s);
               setText(s);
               popupState.close();
            };
            return (
               <ListItem key={s} button onClick={handleHistoryClick}>
                  <ListItemText primary={s} />
               </ListItem>
            );
         }),
      [searchQueries]
   );

   return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
         <Grid container>
            <Grid item xs>
               <div style={{ marginLeft: 3, marginRight: 3 }}>
                  <TextField
                     value={text}
                     fullWidth
                     size="small"
                     helperText="Enter text to search"
                     variant="outlined"
                     onKeyDown={handleKeyDown}
                     onChange={handleTextChanged}></TextField>
               </div>
            </Grid>
            <Grid item xs={1}>
               <IconButton
                  size="small"
                  edge="end"
                  {...bindToggle(popupState)}
                  style={{ marginTop: 3 }}>
                  <HistoryIcon></HistoryIcon>
               </IconButton>
            </Grid>
         </Grid>
         <Popover
            {...bindPopover(popupState)}
            anchorOrigin={{
               vertical: 'bottom',
               horizontal: 'left',
            }}
            transformOrigin={{
               vertical: 'top',
               horizontal: 'right',
            }}
            anchorPosition={{ top: 9, left: -3 }}>
            <div className={classes.recentSearches}>
               <Typography
                  variant="subtitle1"
                  style={{
                     margin: 6,
                     marginBottom: 6,
                  }}>
                  {'  '}
                  <strong>Sᴇᴀʀᴄʜ Hɪsᴛᴏʀʏ</strong>
               </Typography>
               <List dense>{searchQueriesMemo}</List>
            </div>
         </Popover>
         <FullReferences
            searchResults={result}
            status={status}></FullReferences>
         <RelatedReferences
            searchResults={result}
            status={status}></RelatedReferences>
         {status === thunkStatus.idle &&
            result.fullTitle.length === 0 &&
            result.related.length === 0 && (
               <Typography
                  variant="h6"
                  style={{ marginBottom: 15, marginTop: 30 }}
                  gutterBottom>
                  📚 Search your space and see their contents here!
               </Typography>
            )}
         {status === thunkStatus.rejected && <div>error!</div>}
      </ErrorBoundary>
   );
};
export default SearchPane;

const FullReferences = ({
   searchResults,
   status,
}: {
   searchResults: SearchReferences;
   status: thunkStatus;
}) => {
   const classes = useStyles();

   const fullTitle = searchResults.fullTitle;
   const fullTitleMemo = useMemo(
      () =>
         fullTitle.map((u) => {
            return <Reference key={u.id} refData={u}></Reference>;
         }),
      [fullTitle]
   );

   return (
      <Suspense fallback={LoadingSection}>
         {status === thunkStatus.pending && <LoadingSection></LoadingSection>}
         {status === thunkStatus.fulfilled && (
            <>
               <Typography className={classes.sections} variant="h5">
                  <b>Sᴇᴀʀᴄʜ Rᴇsᴜʟᴛs</b>
               </Typography>
               {fullTitleMemo}
               {fullTitle.length === 0 && <NothingToFind />}
            </>
         )}
      </Suspense>
   );
};

const RelatedReferences = ({
   searchResults,
   status,
}: {
   searchResults: SearchReferences;
   status: thunkStatus;
}) => {
   const classes = useStyles();
   const related = searchResults.related;
   const relatedMemo = useMemo(
      () =>
         related.map((u) => {
            return <Reference key={u.id} refData={u}></Reference>;
         }),
      [related]
   );

   return (
      <Suspense fallback={LoadingSection}>
         {status === thunkStatus.pending && <LoadingSection></LoadingSection>}
         {status === thunkStatus.fulfilled && (
            <>
               <Typography className={classes.sections} variant="h5">
                  <b>Sɪᴍɪʟᴀʀ Nᴏᴛᴇs</b>
               </Typography>
               {relatedMemo}
               {related.length === 0 && <NothingToFind />}
            </>
         )}
      </Suspense>
   );
};
