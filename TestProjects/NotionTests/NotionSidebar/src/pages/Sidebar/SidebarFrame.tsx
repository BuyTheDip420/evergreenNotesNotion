import React from 'react';
import ReactDOM from 'react-dom';

export const mountSidebar = (sidebar: HTMLElement, tabId: number) => {
   console.log('render');
   chrome.extension.getURL('sidebar.html');

   ReactDOM.render(<LoadSidebarFrame />, sidebar);
};

export const LoadSidebarFrame = () => {
   let url = chrome.extension.getURL('sidebar.html');

   return (
      <div>
         <iframe title="Notion Sidebar Extension" src={url}></iframe>
      </div>
   );
};
