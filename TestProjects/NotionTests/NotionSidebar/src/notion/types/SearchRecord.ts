import { RecordMap, Record, BlockRecord } from './notionV3/notionRecordTypes';
import { Map } from './notionV3/Map';
import * as blockTypes from './notionV3/notionBlockTypes';
import { BlockTypes, BlockProps } from './notionV3/BlockTypes';
import { NotionBlockModel, NotionBlock } from './NotionBlock';
import { SearchResultType } from 'aNotion/api/v3/SearchApiTypes';

export interface SearchRecordModel {
   id: string;
   isNavigable: boolean;
   score: number;
   highlight: HighlightType;
   notionBlock: NotionBlockModel;
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
   notionBlock: NotionBlockModel;

   constructor(data: RecordMap, searchResult: SearchResultType) {
      this.id = searchResult.id;
      this.isNavigable = searchResult.isNavigable;
      this.highlight = searchResult.highlight;
      this.score = searchResult.score;
      this.notionBlock = new NotionBlock(data, this.id);
      this.cleanHighlight(this.highlight);
   }

   cleanHighlight(highlight: HighlightType) {
      highlight.pureText = highlight.text.split('<gzkNfoUU>').join('');
      highlight.pureText = highlight.pureText.split('</gzkNfoUU>').join('');
      highlight.text = highlight.text.split('gzkNfoUU').join('b');
   }

   toSerializable = (): SearchRecordModel => {
      let model: SearchRecordModel = {
         id: this.id,
         isNavigable: this.isNavigable,
         score: this.score,
         highlight: this.highlight,
         notionBlock: (this.notionBlock as NotionBlock).toSerializable(),
      };
      return model;
   };
}
