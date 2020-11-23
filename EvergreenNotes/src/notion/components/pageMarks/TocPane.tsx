import { makeStyles, createStyles, Grid } from '@material-ui/core';
import { ErrorBoundary, ErrorFallback } from 'aCommon/Components/ErrorFallback';
import { INotionBlockModel } from 'aNotion/models/NotionBlock';
import {
   currentPageSelector,
   pageMarksSelector,
} from 'aNotion/providers/storeSelectors';
import { BlockTypeEnum } from 'aNotion/types/notionV3/BlockTypes';
import { thunkStatus } from 'aNotion/types/thunkStatus';
import React, { Suspense, useEffect, useState } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { BlockUi } from '../blocks/BlockUi';
import { PageUi } from '../blocks/PageUi';
import { LoadingSection, NothingToFind } from '../common/Loading';
import { handleNavigateToBlockInNotion } from './NavigateToBlockInNotion';

const useStyles = makeStyles(() =>
   createStyles({
      spacing: {
         marginBottom: 18,
      },
      toc: {
         cursor: 'pointer',
      },
   })
);

type TIndentType = {
   level: number;
   type: BlockTypeEnum;
};

type TLimitedIndentTree = {
   [key: string]: 'Level1' | 'Level2';
};

/**
 * Table of Contents Pane
 */
export const TocPane = () => {
   const { pageMarks, status } = useSelector(pageMarksSelector, shallowEqual);
   const { currentPageData } = useSelector(currentPageSelector, shallowEqual);

   const [tree, setTree] = useState<TLimitedIndentTree>(createLimitedTree());

   let classes = useStyles();
   const headers: INotionBlockModel[] = pageMarks?.headers ?? [];
   const pageBlock: INotionBlockModel | undefined = currentPageData?.pageBlock;
   const nothingFound = headers.length === 0;

   const hasH1 = headers.some((f) => f.type === BlockTypeEnum.Header1);
   const hasH2 = headers.some((f) => f.type === BlockTypeEnum.Header2);

   useEffect(() => {
      if (status === thunkStatus.fulfilled) {
         const tempTree = createLimitedTree(headers, pageBlock?.blockId);
         setTree(tempTree);
      } else if (Object.keys(tree).length > 0) {
         setTree({});
      }
   }, [headers, status, pageBlock?.blockId]);

   let previousHeaderIndent: TIndentType = {
      level: 0,
      type: BlockTypeEnum.Header1,
   };

   const toc = (
      <Grid container>
         {headers.length > 0 &&
            currentPageData?.pageBlock != null &&
            currentPageData?.pageBlock.blockId != null && (
               <>
                  <Grid item xs={12}>
                     <PageUi
                        block={currentPageData?.pageBlock}
                        inlineBlock={false}
                        interactive={false}
                        showContent={false}></PageUi>
                  </Grid>
                  <Grid item xs={12} className={classes.spacing}></Grid>
               </>
            )}
         {headers.map((h, i) => {
            if (h.type === BlockTypeEnum.Header1) {
               const indent: number = 0;

               const cIndent = calculateIndent(indent, h, tree);

               return <TocItems h={h} cIndent={cIndent} />;
            } else if (h.type === BlockTypeEnum.Header2) {
               const indent: number = hasH1 ? 1 : 0;

               setPreviousHeaderIndent(previousHeaderIndent, indent, h);
               const cIndent = calculateIndent(indent, h, tree);

               return <TocItems h={h} cIndent={cIndent} />;
            } else if (h.type === BlockTypeEnum.Header3) {
               let indent = 0;
               if (hasH1 && hasH2) {
                  indent = 2;
               } else if (hasH1 || hasH2) {
                  indent = 1;
               }

               setPreviousHeaderIndent(previousHeaderIndent, indent, h);
               const cIndent = calculateIndent(indent, h, tree);

               return <TocItems h={h} cIndent={cIndent} />;
            } else if (h.type === BlockTypeEnum.Toggle) {
               let indent = previousHeaderIndent.level;

               setPreviousHeaderIndent(previousHeaderIndent, indent, h);
               const cIndent = calculateIndent(indent, h, tree);

               return <TocItems h={h} cIndent={cIndent} />;
            }
            return null;
         })}
      </Grid>
   );

   return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
         <Suspense fallback={<LoadingSection />}>
            {status === thunkStatus.fulfilled && toc}
            {status === thunkStatus.fulfilled && headers.length === 0 && (
               <NothingToFind></NothingToFind>
            )}
            {status === thunkStatus.pending && <LoadingSection />}
         </Suspense>
      </ErrorBoundary>
   );
};

export default TocPane;

const createLimitedTree = (
   headers?: INotionBlockModel[],
   pageBlockId?: string | undefined
) => {
   if (headers != null && headers.length > 0 && pageBlockId != null) {
      //get the tree
      let tempTree: TLimitedIndentTree = {};
      headers.forEach((f) => {
         if (f.block!.parent_id === pageBlockId) {
            tempTree[f.blockId] = 'Level1';
         } else {
            tempTree[f.blockId] = 'Level2';
         }
      });

      return tempTree;
   }

   return {};
};

const calculateIndent = (
   indent: number,
   currentBlock: INotionBlockModel,
   tree: TLimitedIndentTree
) => {
   let offset = 0;

   if (tree[currentBlock.blockId] != null) {
      if (tree[currentBlock.blockId] == 'Level1') offset = 0;
      else if (tree[currentBlock.blockId] == 'Level2') offset = 1;
   }

   return indent + offset;
};

const TocItems = ({
   h,
   cIndent,
}: {
   h: INotionBlockModel;
   cIndent: number;
}) => {
   let classes = useStyles();

   return (
      <React.Fragment key={h.blockId}>
         {cIndent > 0 && <Grid item xs={cIndent as any} />}
         <Grid
            item
            xs={(12 - cIndent) as any}
            key={h.blockId}
            className={classes.toc}
            onClick={() => handleNavigateToBlockInNotion(h.blockId)}>
            <BlockUi
               block={h}
               index={0}
               interactive={false}
               doNotRenderChildBlocks={true}></BlockUi>
         </Grid>
      </React.Fragment>
   );
};

function setPreviousHeaderIndent(
   previousHeaderIndent: TIndentType,
   indent: number,
   h: INotionBlockModel
) {
   previousHeaderIndent.level = indent;
   previousHeaderIndent.type = h.type;
}