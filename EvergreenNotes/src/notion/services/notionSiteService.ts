//import { sidebarExtensionActions } from 'aNotion/components/layout/notionSiteSlice';
import {
   CookieData,
   NavigationState,
} from 'aNotion/components/layout/SidebarExtensionState';
import { appDispatch, getAppState } from 'aNotion/providers/appDispatch';
import { isGuid, toGuid } from 'aCommon/extensionHelpers';
import * as queryString from 'query-string';
import { sidebarExtensionSelector } from 'aNotion/providers/storeSelectors';

const cleanValue = (str: string) => {
   return toGuid(
      str
         .replace('%22', '')
         .replace('%20', '')
         .replace('%22', '')
         .replace('%20', '')
         .trim()
   );
};

export const extractNavigationData = (
   url: string | undefined
): NavigationState => {
   let result: NavigationState = {};
   if (url == null) {
      console.log("error: can't get page");
   } else if (isNotionUrl(url)) {
      let data = queryString.parseUrl(url, { parseFragmentIdentifier: true });
      result.locationId = data.fragmentIdentifier;
      if (data.query?.p != null) {
         extractPageAndBackgroundIfValid(data, result);
      } else {
         extractPageIfValid(data, result);
      }
      result.url = url;
      result.notionSite = getNotionSiteUrl(url);
   } else {
      console.log('error: not notion page');
   }
   return result;
};

const getNotionSiteUrl = (url: string): string => {
   let segments = url.split('/');
   let length = segments.length;
   let result = segments.reduce(
      (accumulator: string, value: string, index: number) => {
         if (index < length - 1 && value !== 'https') {
            return accumulator + '/' + value;
         }
         return accumulator;
      }
   );

   return result.trim() + '/';
};

const getGuidFromUrl = (url: string): string => {
   let guid = url.slice(url.length - 32);
   return toGuid(guid.trim());
};

const isNotionUrl = (url: string) => {
   let urlRegex = /^https?:\/\/(?:[^./?#]+\.)?notion.so/;
   if (url != null) {
      if (urlRegex.test(url)) {
         return true;
      }
   }
   return false;
};

export const getPageUrl = (pageId: string) => {
   const sidebar = getAppState(sidebarExtensionSelector);
   return sidebar.navigation.notionSite + pageId.replace(/-/g, '');
};

function extractPageIfValid(
   data: queryString.ParsedUrl,
   result: NavigationState
) {
   if (isGuid(getGuidFromUrl(data.url))) {
      result.pageId = getGuidFromUrl(data.url);
      result.backgroundId = undefined;
   } else {
      result.pageId = undefined;
      result.backgroundId = undefined;
   }
}

function extractPageAndBackgroundIfValid(
   data: queryString.ParsedUrl,
   result: NavigationState
) {
   if (isGuid(data.query.p as string)) {
      result.pageId = toGuid(data.query.p as string);
      result.backgroundId = getGuidFromUrl(data.url);
   } else {
      result.pageId = undefined;
      result.backgroundId = undefined;
   }
}
