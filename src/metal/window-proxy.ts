/*
Copyright 2017 LinkedIn Corp. Licensed under the Apache License,
Version 2.0 (the "License"); you may not use this file except in
compliance with the License. You may obtain a copy of the License
at http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*/

// detect the presence of DOM
import {
  MetaInterface,
  IsDirtyCallbackInterface
} from './interfaces';

const nop = () => 0;

interface WindowProxy {
  hasDOM: boolean;
  hasRAF: boolean;
  getScrollTop: Function;
  getScrollLeft: Function;
  getHeight: Function;
  getWidth: Function;
  bindRootScrollEvent: Function;
  rAF: Function;
  meta: MetaInterface;
  onWindowIsDirtyListeners: IsDirtyCallbackInterface[];
  rootsList: any;
  callIsDirtyListeners: Function;
  disconnectAll: Function;
  disconnectIsDirtyListener: Function;
}

const hasDOM = !!((typeof window !== 'undefined') && window && (typeof document !== 'undefined') && document);
const hasRAF = hasDOM && !!window.requestAnimationFrame;
const throttleDelay: number = 30;

let resizeTimeout: number = 0;
let scrollTimeout: number = 0;
let W: WindowProxy = {
  hasRAF,
  hasDOM,
  getScrollTop: nop,
  getScrollLeft: nop,
  getHeight: nop,
  getWidth: nop,
  rootsList: [],
  onWindowIsDirtyListeners: [],
  rAF: hasRAF ? window.requestAnimationFrame.bind(window) : (callback: Function) => { callback(); },
  bindRootScrollEvent: (root: Element) => { root.addEventListener('scroll', () => W.callIsDirtyListeners(), false); },
  callIsDirtyListeners() {
    if (this.onWindowIsDirtyListeners.length <= 0) { return; }

    this.onWindowIsDirtyListeners.forEach((obj: any) => {
      let { fn, scope } = obj;
      fn.call(scope);
    });
  },
  meta: {
    width: 0,
    height: 0,
    scrollTop: 0,
    scrollLeft: 0
  },
  disconnectIsDirtyListener(id: string) {
    this.onWindowIsDirtyListeners = this.onWindowIsDirtyListeners.filter((obj: any) => {
      return obj.id !== id;
    });
  },
  disconnectAll() {
    this.onWindowIsDirtyListeners = [];
  },
};

// Init after DOM Content has loaded
function hasDomSetup() {
  let se = (<any>document).scrollingElement != null;
  W.getScrollTop = se ? () => (<any>document).scrollingElement.scrollTop : () => (<any>window).scrollY;
  W.getScrollLeft = se ? () => (<any>document).scrollingElement.scrollLeft : () => (<any>window).scrollX;
}

// Memoize window meta dimensions
function windowSetDimensionsMeta() {
  W.meta.height = W.getHeight();
  W.meta.width = W.getWidth();
}

// Memoize window meta scroll position
function windowSetScrollMeta() {
  W.meta.scrollLeft = W.getScrollLeft();
  W.meta.scrollTop = W.getScrollTop();
}

// Only invalidate window isDirty on scroll and resize
function eventThrottle(eventType?: string, root?: Element) {
  switch (eventType) {
    case 'resize':
      window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        windowSetDimensionsMeta();
      }, throttleDelay);
      break;
    case 'scroll':
      window.clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        windowSetScrollMeta();
      }, throttleDelay);
      break;
    default:
      break;
  }

  W.callIsDirtyListeners();
}

if (hasDOM) {
  // Set the height and width immediately because they will be available at this point
  W.getHeight = () => (<any>window).innerHeight;
  W.getWidth = () => (<any>window).innerWidth;

  windowSetDimensionsMeta();
  windowSetScrollMeta();

  if ((<any>document).readyState !== 'loading') {
    hasDomSetup();
  } else {
    (<any>document).addEventListener('DOMContentLoaded', hasDomSetup);
  }

  window.addEventListener('resize', () => eventThrottle('resize'), false);
  window.addEventListener('scroll', () => eventThrottle('scroll'), false);
}

export {
  WindowProxy
};

export default W;
