import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import { useBlockStyles } from './BlockUi';
import { BaseTextUiParameters, TextUi } from './TextUi';

export const BulletUi = ({
   block,
   semanticFilter,
   style,
}: BaseTextUiParameters) => {
   let classes = useBlockStyles();
   return (
      <Grid container alignItems="flex-start" style={style}>
         <Grid item xs={1} className={classes.indentColumnBlock}>
            <Typography display={'inline'} variant={'body1'}>
               {' • '}
            </Typography>
         </Grid>
         <Grid item xs={11}>
            <TextUi
               block={block}
               semanticFilter={semanticFilter}
               style={style}></TextUi>
         </Grid>
      </Grid>
   );
};
