//import { hot } from 'react-hot-loader/root';
import React, {
   useEffect,
   useCallback,
   useState,
   Suspense,
   SyntheticEvent,
} from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import {
   currentPageSelector,
   navigationSelector,
} from 'aNotion/providers/storeSelectors';
import { ErrorFallback, ErrorBoundary } from 'aCommon/Components/ErrorFallback';
import { thunkStatus } from 'aNotion/types/thunkStatus';
import { notionSiteActions } from 'aNotion/components/layout/notionSiteSlice';
import { contentActions } from 'aNotion/components/contents/contentSlice';
import { AppPromiseDispatch } from 'aNotion/providers/appDispatch';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';

import {
   FindInPageTwoTone,
   BookTwoTone,
   SubjectTwoTone,
   RefreshTwoTone,
   SettingsTwoTone,
} from '@material-ui/icons/';
import { lightGreen, grey } from '@material-ui/core/colors';
import {
   makeStyles,
   Theme,
   createStyles,
   Grid,
   Typography,
   IconButton,
} from '@material-ui/core';
import { LoadingTab } from 'aNotion/components/common/Loading';
import { LightTooltip } from 'aNotion/components/common/Styles';
import { flushCache } from 'aUtilities/apiCache';
import { NavigationState } from 'aNotion/components/layout/NotionSiteState';
import { useDebounce, useDebouncedCallback } from 'use-debounce/lib';
import { isGuid } from 'aCommon/extensionHelpers';

const ReferencesPane = React.lazy(
   () => import('aNotion/components/references/ReferencesPane')
);
const MarksPane = React.lazy(
   () => import('aNotion/components/pageMarks/MarksPane')
);
const SearchPane = React.lazy(
   () => import('aNotion/components/references/SearchPane')
);
const OptionsPane = React.lazy(
   () => import('aNotion/components/options/OptionsPane')
);

const useStyles = makeStyles((theme: Theme) =>
   createStyles({
      grouped: {
         margin: theme.spacing(0.5),
         border: 'none',
         '&:not(:first-child)': {
            borderRadius: theme.shape.borderRadius,
         },
         '&:first-child': {
            borderRadius: theme.shape.borderRadius,
         },
      },
      toggleButton: {
         color: lightGreen[700],
         backgroundColor: lightGreen[50],
         '&$checked': {
            color: lightGreen[900],
            backgroundColor: lightGreen[200],
         },
      },
   })
);

export enum LayoutTabs {
   References = 'References',
   Search = 'Search',
   PageMarkups = 'Page Markups',
   Events = 'Events',
   Mentions = 'Mentions',
   Settings = 'Settings',
}

const MenuBar = ({
   tab,
   setTab,
}: {
   tab: LayoutTabs;
   setTab: React.Dispatch<React.SetStateAction<LayoutTabs>>;
}) => {
   const classes = useStyles();

   const dispatch = useDispatch();
   const navigation = useSelector(navigationSelector, shallowEqual);

   const handleTab = (
      event: React.MouseEvent<HTMLElement>,
      newTab: LayoutTabs | null
   ) => {
      if (newTab != null) {
         setTab(newTab);
      }
   };

   const handleRefresh = (e: SyntheticEvent) => {
      refreshSidebarContents(dispatch, navigation);
   };

   return (
      <>
         <div
            style={{
               backgroundColor: lightGreen[50],
               borderRadius: 9,
               padding: 6,
            }}>
            <Grid container justify="flex-start">
               <Grid xs={1} item>
                  <div style={{ marginTop: 11 }}>
                     <LightTooltip
                        title="Refresh Notion Page Information"
                        placement="top">
                        <IconButton size="small" onClick={handleRefresh}>
                           <RefreshTwoTone />
                        </IconButton>
                     </LightTooltip>
                  </div>
               </Grid>
               <Grid xs item container spacing={1} justify="center">
                  <Grid item>
                     <ToggleButtonGroup
                        className={classes.grouped}
                        size="small"
                        value={tab}
                        exclusive
                        onChange={handleTab}>
                        <ToggleButton
                           value={LayoutTabs.References}
                           className={classes.toggleButton}>
                           <BookTwoTone></BookTwoTone>
                        </ToggleButton>
                        <ToggleButton
                           value={LayoutTabs.PageMarkups}
                           className={classes.toggleButton}>
                           <SubjectTwoTone></SubjectTwoTone>
                        </ToggleButton>
                        <ToggleButton
                           value={LayoutTabs.Search}
                           className={classes.toggleButton}>
                           <FindInPageTwoTone></FindInPageTwoTone>
                        </ToggleButton>
                        <ToggleButton
                           value={LayoutTabs.Settings}
                           className={classes.toggleButton}>
                           <SettingsTwoTone></SettingsTwoTone>
                        </ToggleButton>
                     </ToggleButtonGroup>
                  </Grid>
               </Grid>
               <Grid xs={1} item></Grid>
            </Grid>

            <Grid container spacing={1} justify="center">
               <Grid item>
                  <Typography
                     variant="h4"
                     style={{
                        marginTop: 9,
                        marginBottom: 6,
                        fontVariant: 'small-caps',
                     }}>
                     <strong>{tab}</strong>
                  </Typography>
               </Grid>
            </Grid>
         </div>
      </>
   );
};

export const Layout = () => {
   const dispatch: AppPromiseDispatch<any> = useDispatch();
   const navigation = useSelector(navigationSelector, shallowEqual);
   const currentPage = useSelector(currentPageSelector, shallowEqual);
   const state = useSelector((state) => state, shallowEqual);
   const classes = useStyles();
   const [noNotionPageId, setNoNotionPageId] = useState(false);

   const [tab, setTab] = useState(LayoutTabs.References);

   useEffect(() => {
      setTab(LayoutTabs.References);
   }, []);

   useEffect(() => {
      if (navigation.pageId != null && isGuid(navigation.pageId)) {
         setNoNotionPageId(false);
         let promise = dispatch(
            notionSiteActions.fetchCurrentPage({
               pageId: navigation.pageId,
            })
         );

         return () => {
            promise.abort();
         };
      } else if (navigation.pageId == null || !isGuid(navigation.pageId)) {
         //unload notion data
         notionSiteActions.unloadPreviousPage();
         setNoNotionPageId(true);
      }
      return () => {};
   }, [navigation.pageId, navigation.url, dispatch]);

   const [currentPageStatus] = useDebounce(currentPage.status, 250, {
      trailing: true,
   });
   const debouncedUpdateSignal = useDebouncedCallback(
      () => {
         if (
            currentPageStatus === thunkStatus.fulfilled &&
            navigation.pageId != null
         ) {
            refreshSidebarContents(dispatch, navigation);
         } else {
            console.log('currentPage status:' + currentPage.status);
         }
      },
      100,
      {
         maxWait: 100,
      }
   );

   const handleReceiveMessage = useCallback((event) => {
      debouncedUpdateSignal.callback();
   }, []);

   useEffect(() => {
      console.log('useEffect updateEvergreenSidebar');
      window.addEventListener('message', handleReceiveMessage);
      return () => {
         window.removeEventListener('message', handleReceiveMessage);
      };
   }, []);

   return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
         <>
            {noNotionPageId && <NoNotionPageId></NoNotionPageId>}
            {!noNotionPageId && (
               <>
                  <MenuBar tab={tab} setTab={setTab}></MenuBar>
                  <div style={{ marginTop: 12 }}></div>
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                     <Suspense fallback={<LoadingTab />}>
                        <div
                           style={{
                              display:
                                 tab === LayoutTabs.References
                                    ? 'block'
                                    : 'none',
                           }}>
                           <ReferencesPane />
                        </div>
                        <div
                           style={{
                              display:
                                 tab === LayoutTabs.PageMarkups
                                    ? 'block'
                                    : 'none',
                           }}>
                           <MarksPane />
                        </div>
                        <div
                           style={{
                              display:
                                 tab === LayoutTabs.Search ? 'block' : 'none',
                           }}>
                           <SearchPane />
                        </div>
                        {tab === LayoutTabs.Events && (
                           <div>not implemented</div>
                        )}
                        {tab === LayoutTabs.Settings && <OptionsPane />}
                     </Suspense>
                  </ErrorBoundary>
                  <div style={{ marginTop: 12 }}></div>
               </>
            )}
         </>
      </ErrorBoundary>
   );
};

export default Layout;

const NoNotionPageId = () => {
   return (
      <div style={{ padding: 12 }}>
         <div style={{ marginTop: 60 }}></div>
         <Typography variant="h5" style={{ marginTop: 12 }}>
            😵 Couldn't load notion page.
         </Typography>
         <Typography
            variant="subtitle1"
            style={{ marginTop: 12, marginLeft: 3 }}>
            🙋🏾‍♂️ Are you sure you have full access to the space?
         </Typography>
      </div>
   );
};

function refreshSidebarContents(dispatch: any, navigation: NavigationState) {
   console.log('...received refreshSidebarContents updateevergreensidebar');
   if (navigation.pageId != null) {
      flushCache();
      dispatch(contentActions.clearContent({}));
      dispatch(
         notionSiteActions.fetchCurrentPage({
            pageId: navigation.pageId,
         })
      );
   }
}
