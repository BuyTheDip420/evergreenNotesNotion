import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import { NotionBlockModel } from 'aNotion/models/NotionBlock';
import { useStyles } from './BlockUi';
export const CodeUi = ({ block }: { block: NotionBlockModel }) => {
   let classes = useStyles();
   return (
      <Grid container style={{ padding: 12 }}>
         <Grid item xs>
            <Typography
               variant={'body2'}
               className={classes.typography}
               style={{ fontFamily: 'Consolas' }}>
               {block.simpleTitle}
            </Typography>
         </Grid>
      </Grid>
   );
};
