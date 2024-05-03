import $ from 'jquery';
global.$ = global.jQuery = $;
module.exports = {
  
    moduleNameMapper: {
      '^jquery$': 'jquery/dist/jquery.slim.js'
    },
    testEnvironment: 'jsdom',

  };