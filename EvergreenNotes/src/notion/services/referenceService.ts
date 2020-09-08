import {
   SearchResultsType,
   SearchSort,
   BacklinkRecordType,
} from 'aNotion/api/v3/apiRequestTypes';
import { SearchRecord, SearchRecordModel } from 'aNotion/models/SearchRecord';
import {
   SearchReferences,
   defaultSearchReferences,
   BacklinkRecordModel,
} from 'aNotion/components/references/referenceState';
import * as searchApi from 'aNotion/api/v3/searchApi';
import {
   NotionBlockRecord,
   NotionBlockModel,
} from 'aNotion/models/NotionBlock';

export const searchNotion = async (
   query: string,
   abort: AbortController | undefined = undefined
) => {
   let result1 = await searchApi.searchByRelevance(
      query,
      false,
      50,
      SearchSort.Relevance,
      abort?.signal
   );
   if (result1 != null && abort?.signal.aborted !== true) {
      return processSearchResults(query, result1, undefined, undefined);
   }

   return defaultSearchReferences();
};

export const processSearchResults = (
   query: string,
   searchResults: SearchResultsType,
   pageId: string | undefined,
   excludedBlockIds: string[] = [],
   searchLimit: number = 20
): SearchReferences => {
   let fullTitle: SearchRecordModel[] = [];
   let related: SearchRecordModel[] = [];

   for (let s of searchResults.results) {
      try {
         if (
            s.score > 10 &&
            s.highlight != null &&
            s.highlight.text != null &&
            s.id !== pageId &&
            !excludedBlockIds.some((e) => e === s.id)
         ) {
            let data = new SearchRecord(searchResults.recordMap, s);
            filterSearchResults(data, query, fullTitle, related);
         }
      } catch (err) {
         console.log(s);
         console.log(err);
      }
   }

   related = related.sort((x, y) => y.score - x.score).slice(0, searchLimit);
   fullTitle = fullTitle.sort((x, y) => y.score - x.score);

   return {
      related: related,
      fullTitle: fullTitle,
   };
};

const filterSearchResults = (
   data: SearchRecord,
   query: string,
   fullTitle: SearchRecordModel[],
   relatedResults: SearchRecordModel[]
) => {
   let full = new RegExp(query, 'i');
   if (full.test(data.text!)) {
      pushFullTextResults(fullTitle, data);
   } else {
      pushRelatedResults(data, fullTitle, relatedResults);
   }
};
const pushRelatedResults = (
   data: SearchRecord,
   fullTitle: SearchRecordModel[],
   relatedResults: SearchRecordModel[]
) => {
   if (
      !fullTitle.find((x) => x.id === data.id) &&
      !relatedResults.find((x) => x.id === data.id)
   ) {
      relatedResults.push(data.toSerializable());
   }
};

const pushFullTextResults = (
   fullTitle: SearchRecordModel[],
   data: SearchRecord
) => {
   if (!fullTitle.find((x) => x.id === data.id)) {
      fullTitle.push(data.toSerializable());
   }
};

export const processBacklinks = (
   backlinksRecords: BacklinkRecordType
): BacklinkRecordModel[] => {
   let backlinkData: BacklinkRecordModel[] = [];

   backlinksRecords.backlinks.forEach((b) => {
      const rec = new NotionBlockRecord(
         backlinksRecords.recordMap,
         b.mentioned_from.block_id
      );

      if (rec.blockId != null && rec.block != null) {
         backlinkData.push({
            backlinkBlock: rec.toSerializable(),
            path: rec.getParentsNodes(),
         });
      }
   });

   return backlinkData;
};
