const puppeteer = require('puppeteer');
const pick = require('lodash').pick;
const globalVariables = pick(global, ['browser', 'expect']);

const PUPPETEER_OPTIONS = {
  headless: true,
  slowMo: 100,
  timeout: 5000
};

// expose variables: puppeteer headless chrome browser
// this should only run once
before(async function() {
  console.log('BEFORE - THIS SHOULD ONLY RUN ONCE');
  global.browser = await puppeteer.launch(PUPPETEER_OPTIONS);
});

// close browser
// reset global variables: expect, browser
// this should only run once
after(function() {
  console.log('AFTER - THIS SHOULD ONLY RUN ONCE');
  global.browser.close();
  global.browser = globalVariables.browser;
});
