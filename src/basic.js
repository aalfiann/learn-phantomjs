"use strict";
var page = require('webpage').create();
page.open('http://example.com', function (status) {
  console.log('Status: ' + status);
  if (status === 'success') {
    page.render('screenshots/basic.png');
  }
  phantom.exit();
})
