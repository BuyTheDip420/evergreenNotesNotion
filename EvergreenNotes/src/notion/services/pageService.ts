import { NotionBlockRecord } from 'aNotion/models/NotionBlock';
import { BlockTypes } from 'aNotion/types/notionV3/BlockTypes';
import { NotionPageMarks } from 'aNotion/models/NotionPage';
import { BaseTextBlock } from 'aNotion/types/notionV3/typings/basic_blocks';
import { isBackGroundColor } from './blockService';
import * as blockApi from 'aNotion/api/v3/blockApi';
import {
   RecordMap,
   Record,
   BlockRecord,
} from 'aNotion/types/notionV3/notionRecordTypes';
import { Block } from 'aNotion/types/notionV3/notionBlockTypes';

export const processPageForMarks = async (
   pageId: string,
   record: NotionBlockRecord,
   signal: AbortSignal
): Promise<NotionPageMarks> => {
   let pageMarks: NotionPageMarks = {
      pageId: pageId,
      highlights: [],
      todos: [],
      quotes: [],
      events: [],
      mentions: [],
      code: [],
      comments: [],
      links: [],
   };

   let contentIds = record.recordMapData.block[pageId].value?.content ?? [];
   await buildPageRecords(record.recordMapData, pageId, contentIds, signal);
   traverseForMarks(
      record.recordMapData,
      pageId,
      contentIds,
      signal,
      pageMarks
   );

   return pageMarks;
};

const buildPageRecords = async (
   recordMapData: RecordMap,
   pageId: string,
   contentIds: string[],
   signal: AbortSignal
) => {
   if (signal.aborted) return;

   let haveData = contentIds.every((c) =>
      Object.keys(recordMapData.block).includes(c)
   );

   let content: { [key: string]: BlockRecord } = {};
   if (!haveData) {
      content = (await blockApi.syncRecordValues(contentIds ?? [], signal))
         .recordMap.block;
      Object.assign(recordMapData.block, content);
   } else {
      Object.entries(recordMapData.block)
         .filter(([blockId, block]) => contentIds.includes(blockId))
         .map(([blockId, block]) => (content[blockId] = block));
   }

   let subContentIds: string[] = [];
   Object.entries(content).forEach(([blockId, block]) => {
      let checkSubContents =
         block.value?.type !== BlockTypes.Page &&
         block.value?.type !== BlockTypes.CollectionViewPage;

      if (checkSubContents)
         subContentIds = subContentIds.concat(block.value?.content ?? []);
   });

   if (subContentIds.length > 0 && !signal.aborted) {
      await buildPageRecords(recordMapData, pageId, subContentIds, signal);
   }
};

const traverseForMarks = (
   recordMapData: RecordMap,
   pageId: string,
   contentIds: string[],
   signal: AbortSignal,
   pageMarks: NotionPageMarks
) => {
   if (signal.aborted) return;

   contentIds.forEach((blockId) => {
      let block = recordMapData.block[blockId];
      let subContentIds = block.value?.content ?? [];
      let checkSubContents =
         block.value?.type !== BlockTypes.Page &&
         block.value?.type !== BlockTypes.CollectionViewPage;

      getMarksInBlock(block, recordMapData, pageId, pageMarks);
      if (subContentIds.length > 0 && checkSubContents) {
         traverseForMarks(
            recordMapData,
            pageId,
            subContentIds,
            signal,
            pageMarks
         );
      }
   });
};

const getMarksInBlock = (
   block: Record<Block>,
   recordMapData: RecordMap,
   pageId: string,
   pageMarks: NotionPageMarks
) => {
   try {
      let b = block.value as BaseTextBlock;
      let blockRecord = new NotionBlockRecord(recordMapData, b.id);
      let nb = blockRecord.toSerializable();

      if (
         isBackGroundColor(b.format?.block_color) ||
         blockRecord.hasBgColor()
      ) {
         pageMarks.highlights.push(nb);
      }

      if (b.type === BlockTypes.Code || blockRecord.hasCode()) {
         pageMarks.code.push(nb);
      }

      if (b.type === BlockTypes.Code || blockRecord.hasComments()) {
         pageMarks.comments.push(nb);
      }

      if (b.type === BlockTypes.Bookmark || blockRecord.hasLinks()) {
         pageMarks.links.push(nb);
      }

      if (blockRecord.hasMentions()) {
         pageMarks.mentions.push(nb);
      }

      if (b.type === BlockTypes.ToDo) {
         pageMarks.todos.push(nb);
      }

      if (b.type === BlockTypes.Quote) {
         pageMarks.quotes.push(nb);
      }
   } catch {
      //ignore cast errors, if its not a BaseTextBlock, such as collections
   }
};