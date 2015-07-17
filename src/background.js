chrome.runtime.onMessage.addListener(
  (msg) => {
    document.body.innerHTML = msg;
    document.body.firstChild.click();
    document.body.innerHTML = '';
  }

);
