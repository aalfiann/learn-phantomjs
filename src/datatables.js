"use strict";

var page = require('webpage').create();
var system = require('system');

function waitFor(testFx, onReady, timeOutMillis) {
  var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
    start = new Date().getTime(),
    condition = false,
    interval = setInterval(function() {
      if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
        // If not time-out yet and condition not yet fulfilled
        condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
      } else {
        if(!condition) {
          // If condition still not fulfilled (timeout but condition is 'false')
          console.log("'waitFor()' timeout");
          phantom.exit(1);
        } else {
          // Condition fulfilled (timeout and/or condition is 'true')
          console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
          typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
          clearInterval(interval); //< Stop this interval
        }
      }
    }, 250); //< repeat check every 250ms
};

if (system.args.length !== 1) {
  console.log('invalid call');
  phantom.exit(1);
} else {
  // set viewport
  page.viewportSize = {
    width: 800,
    height: 600
  }

  // set listen on request page
  // page.onResourceRequested = function (request) {
  //   console.log('Request ' + JSON.stringify(request, undefined, 4))
  // }

  // set listen on error page
  page.onError = function (msg, trace) {
    console.log(msg);
    trace.forEach(function (item) {
      console.log('  ', item.file, ':', item.line);
    });
  }

  // set listen console from web target
  page.onConsoleMessage = function (msg) {
    console.log(msg);
  }

  page.open('https://datatables.net/examples/data_sources/ajax', function (status) {
    // Check for page load success
    if (status !== 'success') {
      console.log('Unable to access network');
      phantom.exit();
    } else {
      console.log('Status: ' + status);
      // Wait for 'tbody' to be visible
      waitFor(function() {
        // Check in the page if a specific element is now visible
        return page.evaluate(function() {
            return $("tbody").is(":visible");
        });
      }, function() {
        console.log("The tbody should be visible now.");
        // get the data from datatables
        page.evaluate(function () {
          console.log(document.title);
          var tBody = document.querySelector('tbody');
          var tableRow = tBody.getElementsByTagName('tr');
          for (var t = 0; t < tableRow.length; t++) {
            console.log(tableRow[t].innerText);
          }
        })
        // take a screenshot
        page.render('screenshots/datatables.png');
        // exit phantomjs
        phantom.exit();
      });
    }
  })
}
