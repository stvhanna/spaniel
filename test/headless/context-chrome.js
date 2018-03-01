/*
Copyright 2017 LinkedIn Corp. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software  distributed under the License is distributed on an "AS IS" BASIS,  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*/

import { assert } from 'chai';
import constants from '../constants';
import Nightmare from 'nightmare';
import rsvp from 'rsvp';

// const puppeteer = require('puppeteer');
// const { expect } = require('chai');
// const _ = require('lodash');
// const globalVariables = _.pick(global, ['browser', 'expect']);

// // puppeteer options
// const opts = {
//   headless: false,
//   slowMo: 100,
//   timeout: 10000
// };

// // expose variables
// before (async function () {
//   global.expect = expect;
//   global.browser = await puppeteer.launch(opts);
// });

// // close browser and reset global variables
// after (function () {
//   browser.close();

//   global.browser = globalVariables.browser;
//   global.expect = globalVariables.expect;
// });


const { 
  VIEWPORT,
  NIGHTMARE,
  PUPPETEER,
  MAC_WINDOW_BAR_HEIGHT
} = constants;

export default class Context {
  constructor() {
    this._puppeteer = puppeteer.launch(PUPPETEER.OPTIONS);
    this._nightmare.viewport(VIEWPORT.WIDTH, VIEWPORT.HEIGHT + MAC_WINDOW_BAR_HEIGHT);
    this._events = [];
    this._results = [];
    this._assertions = [];
    this._execution = this._root = this._nightmare.goto('http://localhost:3000/').wait(NIGHTMARE.TIMEOUT).evaluate(function() {
      window.STATE = {};
    });
  }
  close() {
    return 
  }

  getExecution() {
    return this._execution;
  }

  evaluate(func) {
    this._execution = this._execution.evaluate(func);
    return this;
  }

  assert(func, assertion) {
    this._execution.evaluate(func).then(assertion);
    return this;
  }

  viewport(width, height) {
    this._execution = this._execution.viewport(width, height).wait(NIGHTMARE.TIMEOUT);
    return this;
  }

  scrollTo(top, left) {
    this._execution = this._execution.scrollTo(top, left).wait(NIGHTMARE.TIMEOUT);
    return this;
  }

  wait(time) {
    this._execution = this._execution.wait(time);
    return this;
  }
}
