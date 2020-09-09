import React from 'react';
import {
   Typography,
   Divider,
   makeStyles,
   createStyles,
   Theme,
} from '@material-ui/core';
import { NotionBlockModel } from 'aNotion/models/NotionBlock';
import { BlockTypes } from 'aNotion/types/notionV3/BlockTypes';
import { Variant } from '@material-ui/core/styles/createTypography';
import { grey } from '@material-ui/core/colors';
import { PageUi } from './PageUi';
import { BulletUi } from './BulletUi';
import { TodoUi } from './TodoUi';
import { QuoteUi } from './QuoteUi';
import { CalloutUi } from './CalloutUi';
import { CodeUi } from './CodeUi';
import { ToggleUi } from './ToggleUi';
import { NumberUi } from './NumberUi';
import { NotionColor } from 'aNotion/types/notionV3/notionBaseTypes';
import { shallowEqual } from 'react-redux';
import { navigationSelector } from 'aNotion/providers/storeSelectors';
import {
   getBackgroundColor,
   getForegroundColor,
} from 'aNotion/services/blockService';
import { TextUi } from './TextUi';

export const useBlockStyles = makeStyles((theme: Theme) =>
   createStyles({
      block: {
         margin: 6,
         padding: 3,
      },
      typography: {
         overflowWrap: 'break-word',
         wordBreak: 'break-word',
         position: 'relative',
      },
      inlineIcon: {
         position: 'relative',
         top: 3,
      },
      link: {
         overflowWrap: 'anywhere',
         wordBreak: 'break-all',
         color: grey[600],
      },
   })
);

export const BlockUi = ({
   block,
   index,
}: {
   block: NotionBlockModel;
   index: number | undefined;
}) => {
   let classes = useBlockStyles();
   let variant = useVariant(block);
   let backgroundColor = getBackgroundColor(block);
   let color = getForegroundColor(block);

   return (
      <div
         className={classes.block}
         style={{ backgroundColor: backgroundColor, color: color }}>
         {variant != null && (
            <TextUi
               variant={variant}
               block={block}
               bgColor={backgroundColor}
               color={color}></TextUi>
         )}
         {block.type === BlockTypes.Divider && <Divider></Divider>}
         {block.type === BlockTypes.Callout && (
            <CalloutUi block={block}></CalloutUi>
         )}
         {block.type === BlockTypes.Quote && <QuoteUi block={block} />}
         {block.type === BlockTypes.ButtetedList && <BulletUi block={block} />}
         {block.type === BlockTypes.NumberedList && <NumberUi block={block} />}
         {block.type === BlockTypes.ToDo && <TodoUi block={block} />}
         {block.type === BlockTypes.Page && <PageUi block={block} />}
         {block.type === BlockTypes.Toggle && <ToggleUi block={block} />}
         {block.type === BlockTypes.Code && <CodeUi block={block} />}
      </div>
   );
};
export default BlockUi;

const useVariant = (block: NotionBlockModel) => {
   let variant: Variant | undefined;
   switch (block.type) {
      case BlockTypes.Text:
      case BlockTypes.Date:
      case BlockTypes.Bookmark:
         variant = 'body1';
         break;
      case BlockTypes.Header1:
      case BlockTypes.CollectionViewPage:
         variant = 'h4';
         break;
      case BlockTypes.Header2:
         variant = 'h5';
         break;
      case BlockTypes.Header3:
         variant = 'h6';
         break;
   }
   return variant;
};
