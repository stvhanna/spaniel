/*
Copyright 2017 LinkedIn Corp. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software  distributed under the License is distributed on an "AS IS" BASIS,  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*/

import { assert } from 'chai';
// import Context from './context';
import Context from './puppeteer-context';
import SpanielContext from './spaniel-context';

// General approach shamelessly stolen and tweaked from
// https://github.com/emberjs/ember.js/blob/master/packages/ember-glimmer/tests/utils/abstract-test-case.js




export class TestClass {
  constructor(page) {
    this.context = this.generateContext(page);
  }
  teardown() {
    console.log('TEARDOWN WAS CALLED');
    this.context.close();
  }
  generateContext(page) {
    return new Context(page);
  }
}

export class WatcherTestClass extends TestClass {
  generateContext() {
    return new SpanielContext();
  }
}


/*
  description: abstraction function that wraps mocha's `describe` and `it` methods.
  This default function is commonly imported as "testModule".
  
  @moduleName: String
  example: 'Window Proxy'

  @TestModuleClass: Class
  example: TestClass or WatcherTestClass
*/


export default function(moduleName, TestModuleClass) {
  describe(moduleName, () => {
    let proto = TestModuleClass.prototype;

    while (proto !== Object.prototype) {
      let keys = Object.getOwnPropertyNames(proto);
      keys.forEach(generateTest);
      proto = Object.getPrototypeOf(proto);
    }

    function generateTest(name) {
      if (name.indexOf('@test ') === 0) {
        it(name.slice(5), async () => {
          let page = await browser.newPage();          
          let testInstance = await new TestModuleClass(page);

          return testInstance[name].call(testInstance).then(() => {
            testInstance.teardown();
          });  
        });
      }
    }
  });
}
