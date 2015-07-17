'use strict';

chrome.runtime.onMessage.addListener(function (msg) {
  document.body.innerHTML = msg;
  document.body.firstChild.click();
  document.body.innerHTML = '';
});