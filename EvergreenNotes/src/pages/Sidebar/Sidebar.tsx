//import { hot } from 'react-hot-loader';

import React, { useEffect, Suspense } from 'react';
import { Provider } from 'react-redux';
import reduxStore from 'aNotion/providers/reduxStore';
import { appDispatch } from 'aNotion/providers/appDispatch';
import { activeTab } from 'aCommon/extensionHelpers';
import { sidebarExtensionActions } from 'aNotion/components/layout/sidebarExtensionSlice';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from 'aCommon/Components/ErrorFallback';
import {
   ThemeProvider,
   Paper,
   Box,
   makeStyles,
   Theme,
   createStyles,
   Zoom,
   Button,
} from '@material-ui/core';
import { theme } from 'aNotion/components/theme';
import { useWindowSize } from '@react-hook/window-size';
import { SnackbarProvider } from 'notistack';
import { green, yellow, red, grey } from '@material-ui/core/colors';
import { LoadingUnknown } from 'aNotion/components/common/Loading';
import { getOptionsFromStorage } from 'aNotion/components/options/optionsService';
import { appHeight } from 'aSidebar/frameProperties';

const Layout = React.lazy(() => import('aNotion/components/layout/Layout'));

const snackbarRoot = {
   color: grey[500] + '!important',
   maxWidth: 290,
   zIndex: 1000,
};
const useStyles = makeStyles((theme: Theme) =>
   createStyles({
      info: { backgroundColor: grey[100] + '!important', ...snackbarRoot },
      success: { backgroundColor: green[50] + '!important', ...snackbarRoot },
      error: { backgroundColor: red[100] + '!important', ...snackbarRoot },
      warning: {
         backgroundColor: yellow[50] + '!important',
         ...snackbarRoot,
      },
   })
);

console.log('App loading...');
export const Sidebar = () => {
   useEffect(() => {
      setTabId();
      getOptionsFromStorage();
   }, []);

   const [wWidth, wHeight] = useWindowSize();
   const classes = useStyles();

   const notistackRef = React.createRef() as any;
   const onClickDismiss = (key: any) => () => {
      notistackRef.current.closeSnackbar(key);
   };

   return (
      <React.StrictMode>
         <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Provider store={reduxStore}>
               <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <ThemeProvider theme={theme}>
                     <Box
                        height={wHeight}
                        width={wWidth}
                        style={{
                           overflowX: 'hidden',
                           overflowY: 'auto',
                           border: '0px',
                           margin: 0,
                           padding: 0,
                        }}>
                        <SnackbarProvider
                           ref={notistackRef}
                           action={(key) => (
                              <Button onClick={onClickDismiss(key)}>
                                 Dismiss
                              </Button>
                           )}
                           classes={{
                              variantSuccess: classes.success,
                              variantError: classes.error,
                              variantWarning: classes.warning,
                              variantInfo: classes.info,
                           }}
                           autoHideDuration={1000}
                           maxSnack={2}
                           dense={true}
                           preventDuplicate
                           transitionDuration={{ enter: 200, exit: 75 }}
                           variant="info"
                           anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'center',
                           }}>
                           <Paper
                              elevation={3}
                              style={{
                                 padding: 12,
                                 paddingTop: 0,
                                 overflow: 'hidden',
                                 minHeight: appHeight(wHeight),
                              }}>
                              <Suspense fallback={<LoadingUnknown />}>
                                 <Layout />
                              </Suspense>
                           </Paper>
                        </SnackbarProvider>
                     </Box>
                  </ThemeProvider>
               </ErrorBoundary>
            </Provider>
         </ErrorBoundary>
      </React.StrictMode>
   );
};
const setTabId = async () => {
   let w = window as any;
   if (w.contentTabId === undefined) {
      let tab = await activeTab();
      let tabId = tab.id!;
      w.contentTabId = tabId;
      appDispatch(sidebarExtensionActions.updateNavigationData(tab.url!));
   }
};

export default Sidebar;
