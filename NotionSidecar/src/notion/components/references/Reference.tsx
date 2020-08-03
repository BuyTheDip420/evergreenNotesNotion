import React, { MouseEvent, useState, SyntheticEvent } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import ReactHtmlParser from 'react-html-parser';

import { Skeleton } from '@material-ui/lab';

import {
   Button,
   Dialog,
   List,
   ListItem,
   ListItemText,
   Breadcrumbs,
   Typography,
   Grid,
   withStyles,
   makeStyles,
   Theme,
   createStyles,
   AccordionActions,
} from '@material-ui/core';
import {
   Accordion as MuiAccordion,
   AccordionSummary as MuiAccordionSummary,
   AccordionDetails as MuiAccordionDetails,
} from '@material-ui/core';
import { RefData } from './referenceTypes';
import { ExpandMoreSharp, SystemUpdate } from '@material-ui/icons';
import { NotionBlockModel } from 'aNotion/models/NotionBlock';
import { ErrorFallback, ErrorBoundary } from 'aCommon/Components/ErrorFallback';
import { Content } from '../blocks/Content';
import { navigationSelector } from 'aNotion/providers/storeSelectors';

const Accordion = withStyles({
   root: {
      border: '1px solid rgba(0, 0, 0, .125)',
      boxShadow: 'none',
      // '&:not(:last-child)': {
      //    borderBottom: 0,
      // },
      '&:before': {
         display: 'none',
      },
      '&$expanded': {
         margin: 'auto',
         marginTop: '12px',
         marginBottom: '12px',
      },
   },
   expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles((theme) => ({
   root: {
      backgroundColor: theme.palette.primary.main,
      borderBottom: '1px solid rgba(0, 0, 0, .125)',
      marginBottom: -1,
      minHeight: 42,
      '&$expanded': {
         minHeight: 51,
      },
   },
   content: {
      '&$expanded': {
         margin: '12px 0',
      },
   },
   expanded: {},
}))(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
   root: {
      padding: theme.spacing(2),
      '&$expanded': {
         minHeight: 42,
      },
   },
}))(MuiAccordionDetails);

const useStyles = makeStyles((theme: Theme) =>
   createStyles({
      typography: {
         overflowWrap: 'break-word',
      },
   })
);

export const Reference = ({ refData }: { refData: RefData }) => {
   const navigation = useSelector(navigationSelector, shallowEqual);

   const handleOpen = (e: SyntheticEvent) => {
      e.stopPropagation();
      if (navigation.notionSite != null) {
         let url =
            navigation.notionSite + refData.searchRecord.id.replace('-', '');
         window.open(url, '_blank');
      }
   };

   const handleMiddleOpen = (e: SyntheticEvent) => {
      //e.stopPropagation();
      e.preventDefault();
      if (navigation.notionSite != null) {
         let url =
            navigation.notionSite + refData.searchRecord.id.replace('-', '');
         window.open(url);
      }
      return false;
   };

   const handlePreventMiddelScroll = (e: SyntheticEvent) => {
      e.preventDefault();
      return false;
   };

   let classes = useStyles();
   return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
         <Accordion TransitionProps={{ unmountOnExit: true }}>
            <AccordionSummary expandIcon={<ExpandMoreSharp />}>
               <Grid container spacing={1}>
                  <Grid item xs={12}>
                     <Typography variant="body1" className={classes.typography}>
                        {parse(refData.searchRecord.textByContext)}
                     </Typography>
                  </Grid>
                  <Grid item xs>
                     <Path path={refData.searchRecord.path}></Path>
                  </Grid>
               </Grid>
            </AccordionSummary>
            <AccordionDetails>
               <Grid container spacing={1}>
                  <Grid item xs={12}>
                     <Content
                        blockId={refData.searchRecord.id}
                        contentIds={
                           refData.searchRecord.notionBlock.contentIds
                        }></Content>
                  </Grid>
               </Grid>
            </AccordionDetails>
            <AccordionActions>
               <Button
                  size="small"
                  color="secondary"
                  variant="outlined"
                  onClick={handleOpen}
                  onMouseDown={handlePreventMiddelScroll}
                  onMouseUp={handleMiddleOpen}>
                  Open in a new tab
               </Button>
            </AccordionActions>
         </Accordion>
      </ErrorBoundary>
   );
};

const parse = (textByContext: string[]) => {
   return (
      <React.Fragment>
         {textByContext.map((f, i) => {
            if (i % 2 === 1) {
               return <strong key={i}>{f}</strong>;
            } else {
               return <React.Fragment key={i}>{f}</React.Fragment>;
            }
         })}
      </React.Fragment>
   );
};

const getTitle = (title: string) => {
   if (title.length > 30) return title.substring(0, 30) + '...';
   else return title;
};

const Path = ({ path }: { path: NotionBlockModel[] }) => {
   return (
      <Breadcrumbs maxItems={4}>
         {path.map((p) => (
            <Typography variant="caption" key={p.blockId}>
               {getTitle(p.simpleTitle)}
            </Typography>
         ))}
      </Breadcrumbs>
   );
};
