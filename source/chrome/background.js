chrome.runtime.onInstalled.addListener(function (object) {
  chrome.tabs.create({url: chrome.extension.getURL("options.html")}, function (tab) {
  });
});
