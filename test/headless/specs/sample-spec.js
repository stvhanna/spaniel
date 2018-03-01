import { 
  expect,
  assert
} from 'chai';

import {
  default as testModule,
  TestClass
} from './../test-module';

import constants from './../../constants.js';

const { 
  time: { 
    RAF_THRESHOLD
  },
  ITEM_TO_OBSERVE,
  VIEWPORT
} = constants;

testModule('Window Proxy', class extends TestClass {
  ['@test disconnect all works']() {
    return this.context.evaluate(() => {
      window.watcher = new spaniel.Watcher();
      window.target = document.querySelector('.tracked-item[data-id="6"]');
      window.watcher.watch(window.target, () => {});
    })
    .wait(RAF_THRESHOLD * 5)
    .evaluate(() => {
      window.watcher.destroy();
      spaniel.__w__.disconnectAll();
    })
    .getExecution()
    .evaluate(() => {
      return spaniel.__w__.onWindowIsDirtyListeners.length;
    }).then(function(result) {
      assert.equal(result, 0, 'All window isDirty listeners have been removed');
    });
  }
});

// testModule('another test', class extends TestClass {
//   ['@test confirm we can access the global browser']() {
//     expect(true).to.be.true;
//   }
// });

// testModule('another test of browser version', class extends TestClass {
//   ['@test confirm we can access the global browser again']() {
//     browser.version().then(function (v) {
//       expect(true).to.be.true;
//     })
//   }
// });

// describe('sample test', function () {
//   it('should work', function () {
//     expect(true).to.be.true;
//   });
// });

// describe('spit out browser version - async/await', function () {
//   it('should work', async function () {
//     console.log(await browser.version());

//     expect(true).to.be.true;
//   });
// });

// describe('spit out browser version - promises', function () {
//   it('should work', function (done) {
//     browser.version().then(function (v) {
//       console.log(v);
//       expect(true).to.be.true;
//       done();
//     })
//   });
// });

// describe('sample test', function () {
//   let page;

//   before (async function () {
//     page = await browser.newPage();
//     await page.goto('http://localhost:3000');
//   });

//   after (async function () {
//     await page.close();
//   })

//   it('should have the correct page title', async function () {
//     expect(await page.title()).to.eql('Spaniel Test App');
//   });

//   it('should have a single app div', async function () {
//     const APP_SELECTOR = '#app';

//     await page.waitFor(APP_SELECTOR);

//     expect(await page.$$(APP_SELECTOR)).to.have.lengthOf(1);
//   });
// });
