browser.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.verbthenoun == "options")
      browser.runtime.openOptionsPage();
  }
);

chrome.runtime.onInstalled.addListener(function (object) {
  browser.runtime.openOptionsPage();
});
