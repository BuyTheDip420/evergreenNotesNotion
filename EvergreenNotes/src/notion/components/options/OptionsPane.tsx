import React, { Suspense, useState, useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import {
   makeStyles,
   createStyles,
   Typography,
   Grid,
   Switch,
   FormGroup,
   FormControlLabel,
   Link,
} from '@material-ui/core';
import { pageMarksSelector } from 'aNotion/providers/storeSelectors';
import { thunkStatus } from 'aNotion/types/thunkStatus';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from 'aCommon/Components/ErrorFallback';
import {
   LoadingSection,
   NothingToFind,
} from 'aNotion/components/common/Loading';
import { appOptions, saveOptionsToStorage } from './optionsService';
import { AppOptions, AppOptionDescriptions } from './optionsTypes';

const useStyles = makeStyles(() =>
   createStyles({
      sections: {
         marginLeft: 6,
         marginTop: 36,
         marginBottom: 12,
         fontVariant: 'small-caps',
      },
      spacing: {
         marginBottom: 42,
      },
   })
);

export const OptionsPane = () => {
   let classes = useStyles();

   const [options, setOptions] = useState<AppOptions>();

   useEffect(() => {
      setOptions(appOptions);
   }, []);

   useEffect(() => {
      //TODO change this later, when we have more options.
      if (options != null) {
         saveOptionsToStorage(options);
      }
   }, [options]);

   return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
         <Suspense fallback={<LoadingSection />}>
            {/* <Typography className={classes.sections} variant="h5">
               <b>General</b>
            </Typography>
            {options != null && (
               <div>
                  <FormGroup>
                     <FormControlLabel
                        label={AppOptionDescriptions.darkmode}
                        control={
                           <Switch
                              checked={options.darkmode}
                              onChange={() =>
                                 (options.darkmode = !options.darkmode)
                              }
                              color="primary"
                           />
                        }
                     />
                  </FormGroup>
               </div>
            )} */}
            <div className={classes.spacing}></div>
            <Typography className={classes.sections} variant="h5">
               <b>Information and Feedback</b>
            </Typography>
            <Grid style={{ marginLeft: 6 }}>
               <Link
                  variant="subtitle1"
                  target="_blank"
                  href="https://www.notion.so/shravansunder/Evergreen-Notes-For-Notion-e35e6ed4dd5a45b19bf2de2bb86b1a7e">
                  Website
               </Link>
               <div></div>
               <Link
                  variant="subtitle1"
                  target="_blank"
                  href="mailto:evergreen.software.dev@gmail.com">
                  Email
               </Link>
            </Grid>
         </Suspense>
      </ErrorBoundary>
   );
};

export default OptionsPane;