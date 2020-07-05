import superagent from 'superagent';
//import { LoadPageChunk } from 'typings/notion-api/v3/loadPageChunk';

export const loadPageChunk = async (pageId: string): Promise<any> => {
   let response = await superagent
      .post('https://www.notion.so/api/v3/loadPageChunk')
      .send({
         pageId: pageId,
         limit: 10,
         chunkNumber: 0,
         verticalColumns: false,
      });
   console.log(response.body);
   return response.body;
};

// {
//    "pageId": "ae094404-f2c3-4274-8ffe-9cf93b0bfcea",
//    "limit": 1,
//    "chunkNumber": 100,
//    "verticalColumns": true
// }
