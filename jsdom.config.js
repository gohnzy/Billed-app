const { JSDOM } = require('jsdom');

const jsdomConfig = {
  url: 'http://localhost',
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true,
};

const dom = new JSDOM('<!doctype html><html><body></body></html>', jsdomConfig);
global.window = dom.window;
global.document = dom.window.document;
global.navigator = {
  userAgent: 'node.js',
};
