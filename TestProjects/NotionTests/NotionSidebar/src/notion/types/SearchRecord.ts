import { RecordMap, Record, BlockRecord } from './notionV3/notionRecordTypes';
import { Map } from './notionV3/Map';
import * as blockTypes from './notionV3/notionBlockTypes';
import { BlockNames, BlockProps } from './notionV3/BlockEnums';
import { PageRecordModel, PageRecord } from './PageRecord';
import { SearchResultType } from 'aNotion/api/v3/SearchApiTypes';

export interface SearchRecordModel {
   id: string;
   isNavigable: boolean;
   score: number;
   highlight: {
      pathText: string;
      text: string;
   };
   blockRecord: PageRecordModel;
}
type HighlightType = {
   pathText: string;
   text: string;
   pureText?: string;
};

export class SearchRecord implements SearchRecordModel {
   id: string;
   isNavigable: boolean;
   score: number;
   highlight: HighlightType;
   blockRecord: PageRecord;

   constructor(data: RecordMap, searchResult: SearchResultType) {
      this.id = searchResult.id;
      this.isNavigable = searchResult.isNavigable;
      this.highlight = searchResult.highlight;
      this.score = searchResult.score;
      this.blockRecord = new PageRecord(data, this.id);
   }

   cleanHighlight(highlight: HighlightType) {
      highlight.pureText = highlight.text.replace('<gzkNfoUU>', '');
      highlight.pureText = highlight.text.replace('</gzkNfoUU>', '');
      highlight.text = highlight.text.replace('gzkNfoUU', 'b');
   }

   toSerializable = (): SearchRecordModel => {
      let model: SearchRecordModel = {
         id: this.id,
         isNavigable: this.isNavigable,
         score: this.score,
         highlight: this.highlight,
         blockRecord: this.blockRecord.toSerializable(),
      };
      return model;
   };
}