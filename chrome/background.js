var fullTabId = -1;

function tabDisplay(){
  // we've already got one open... probably
  if(fullTabId >= 0){
    chrome.tabs.get(fullTabId, function (tab) {
      if (chrome.runtime.lastError) {
        // if it disappeared somehow, then open a new one
        chrome.tabs.create({url: chrome.extension.getURL("actionstations.html")}, function (tab) {
          fullTabId = tab.id;
        });
      }
    });
  } else {
    // well we didn't think we had one open, so just do it
    chrome.tabs.create({url: chrome.extension.getURL("actionstations.html")}, function (tab) {
      fullTabId = tab.id;
    });
  }
  chrome.tabs.update(fullTabId, {"active": true}, function(tab){ });
  return(fullTabId);
}

chrome.tabs.onRemoved.addListener(function (tabid, thingy){
  if(tabid == fullTabId){
    fullTabId = -1;
  }
});

chrome.runtime.onInstalled.addListener(function (object) {
  chrome.tabs.create({url: chrome.extension.getURL("options.html")}, function (tab) {
  });
});

chrome.runtime.onStartup.addListener(function (object) {
  chrome.storage.local.get(["actionstations_display_tab"], function(items) {
    if(typeof(items["actionstations_display_tab"]) !== 'undefined' && items["actionstations_display_tab"]){
//      tabDisplay();
    }
  });
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.verbthenoun == "options")
      chrome.tabs.create({url: chrome.extension.getURL("options.html")}, function (tab) {});
//    if (request.verbthenoun == "tab")
//      tabDisplay();
  }
);
