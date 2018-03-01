/*
Copyright 2017 LinkedIn Corp. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software  distributed under the License is distributed on an "AS IS" BASIS,  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*/

import { 
  assert
} from 'chai';
import constants from '../constants';
import puppeteer from 'puppeteer';
import _ from 'lodash';

const globalVariables = _.pick(global, ['browser']);

const { 
  VIEWPORT,
  NIGHTMARE,
  MAC_WINDOW_BAR_HEIGHT
} = constants;

export default class Context {
  constructor(page) {
    this._page = this._execution = page;
    this._page.setViewport({width: 400, height: 400});
    this._page.goto('http://localhost:3000/');
    this._page.evaluate(() => {
      window.STATE = {};
    });

    this._events = [];
    this._results = [];
    this._assertions = [];
  }

  close() {
    console.log('CLOSE WAS CALLED');
    global.browser = globalVariables.browser;
    return this._execution.close();
    // return this;
  }

  getExecution() {
    return this._execution;
    // return this;
  }

  evaluate(func) {
    // this._execution = this._execution.evaluate(() => {
    //   func();
    // });

    return this;
  }

  assert(func, assertion) {
    this._execution = this._execution.evaluate(() => {
      func();
    })
    .then(() => {
      assertion();
    });
    return this;
  }

  viewport(width, height) {
    this._execution = this._execution.setViewport({ width, height });
    return this;
  }

  scrollTo(top, left) {
    this._execution = this._execution.evaluate((top, left) => {
      window.scrollTo(left, top);
    });
    return this;
  }

  wait(time) {
    // this._execution = this._execution.waitForNavigation(time);
    return this;
  }
}
