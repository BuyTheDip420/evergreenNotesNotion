import { mountSidebar } from './SidebarFrame';
import { commands } from 'Common/commands';
import superagent from 'superagent';

console.log('Content script loaded!');

chrome.runtime.onMessage.addListener(async function(
   request,
   sender,
   sendResponse
) {
   if (request.command === commands.receivedCookies) {
      await receivedCookies(request);
   } else if (request.command === commands.extensionOnClick) {
      initalize();
      toggleSidebar();
   }
});

const notionAppId = 'notion-app';
const notionFrameClass = 'notion-frame';
const notionScrollerClass = 'notion-scroller';
const notionNavClass = 'notion-sidebar-container';
const notionSidebarRootId = 'notion-sidebar-root-987384';
const notionBaseNewRootId = 'new-app-root';
const notionAppInnerClass = 'notion-app-inner';
var initalized = false;

const initalize = () => {
   let notionApp = document.getElementById(notionAppId) as HTMLElement;

   if (!notionApp) {
      error('could not find notion elements');
   } else if (!initalized) {
      initalized = true;
      if (!document.getElementById(notionSidebarRootId)) {
         let newRoot = document.createElement('div');
         document.body.appendChild(newRoot);
         newRoot.setAttribute('id', notionBaseNewRootId);

         let sidebarRoot = document.createElement('div');
         sidebarRoot.setAttribute('id', notionSidebarRootId);
         newRoot.appendChild(notionApp);
         newRoot.appendChild(sidebarRoot);
         newRoot.setAttribute(
            'style',
            `display:inline-flex; flex-wrap: nowrap; justify-content: flex-start;`
         );

         window.onresize = () => adjustSidebarWidth(notionApp);
      }

      reduceContentPadding(notionApp);
      adjustSidebarWidth(notionApp);
   }

   let sidebarRoot = document.getElementById(notionSidebarRootId);
   if (sidebarRoot) mountSidebar(sidebarRoot);
   return true;
};

const error = (str: string) => {
   console.log(str);
};

const toggleSidebar = () => {};

async function receivedCookies(request: any) {
   console.log('received cookies', request.notionCookies);
}

function adjustSidebarWidth(notionApp: HTMLElement) {
   let newRoot = document.getElementById(notionBaseNewRootId);
   let sidebarRoot = document.getElementById(notionSidebarRootId);
   let notionFrame = document.getElementsByClassName(
      notionFrameClass
   )[0] as HTMLElement;
   let notionNav = document.getElementsByClassName(
      notionNavClass
   )[0] as HTMLElement;
   let notionContentScroller = notionFrame.getElementsByClassName(
      notionScrollerClass
   )[0] as HTMLElement;
   let notionInnerAppCollection = [
      ...document.getElementsByClassName(notionAppInnerClass)[0].children,
   ];

   if (
      newRoot &&
      sidebarRoot &&
      notionApp &&
      notionFrame &&
      notionContentScroller
   ) {
      let wWidth = window.innerWidth;
      let nNavWidth = Math.round(notionNav.getBoundingClientRect().width);

      let sidebarWidth = Math.round(wWidth * 0.25) - 10;
      let newFrameWidth = wWidth - nNavWidth - sidebarWidth;
      let newAppWidth = newFrameWidth + nNavWidth + 10;

      //Todo add a obeserver: https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
      notionFrame.style.maxWidth = `${newFrameWidth}px`;
      notionContentScroller.style.maxWidth = `${newFrameWidth}px`;
      [...notionInnerAppCollection].forEach((element) => {
         let e = element as HTMLElement;
         e.style.maxWidth = `${newAppWidth}px`;
      });
      notionApp.style.maxWidth = `${newAppWidth}px`;

      sidebarRoot.setAttribute('style', `max-width:${sidebarWidth}px`);
   }
}

const notionPageContentClass = 'notion-page-content';
const notionPageControlsClass = 'notion-page-controls';
function reduceContentPadding(notionApp: HTMLElement) {
   let notionPageContent = notionApp.getElementsByClassName(
      notionPageContentClass
   )[0] as HTMLElement;
   let notionPageControlParent = notionApp.getElementsByClassName(
      notionPageControlsClass
   )[0].parentElement as HTMLElement;

   const offset = ' - 40px ';
   if (notionPageContent != null) {
      notionPageContent.style.paddingLeft =
         notionPageContent.style.paddingLeft + offset;
      notionPageContent.style.paddingRight =
         notionPageContent.style.paddingRight + offset;
      notionPageControlParent.style.paddingLeft =
         notionPageControlParent.style.paddingLeft + offset;
      notionPageControlParent.style.paddingRight =
         notionPageControlParent.style.paddingRight + offset;
   }
}
