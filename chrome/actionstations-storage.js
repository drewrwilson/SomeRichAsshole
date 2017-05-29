/*
 * Storage plugin: Chrome flavor
 */

function actionstationsTooltip(text, bgcolor){
  try {
    chrome.browserAction.setBadgeText({"text":text.toString()});
    chrome.browserAction.setBadgeBackgroundColor({"color":bgcolor});
  } catch (e) {
    if(actionStationsDebug){
      console.log("Can't set Chrome badge tooltip. Probably called from a page context. S'ok");
    }
  }
}

function actionStationsURLOf(asset){
  return(chrome.extension.getURL(asset));
}

function actionStationsVersion(){
  return(chrome.runtime.getManifest().version);
}

/*
 * Dev only: log changes to local storage variables.
 */
function bindStorageListeners(){
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
      var storageChange = changes[key];
      if(actionStationsDebug){
        console.log('Storage key "%s" in namespace "%s" changed. ' +
                'Old value was "%s", new value is "%s".',
                key,
                namespace,
                storageChange.oldValue,
                JSON.stringify(storageChange.newValue, null, " "));
      }
    }
  });
}

/*
 * Save data to local storage. Try to handle failures gracefully.
 */
function setConfig(key, val){
  if(!key){
    console.log("Called setConfig with a null key, that's not kosher");
    return;
  }
  if(!(typeof key  === 'string') && !(key instanceof String)){
    console.log("Called setConfig with a non-string key, that's not kosher");
    console.log(key);
    return;
  }
  var toSave = {};
  toSave[key] = val;
  try {
    chrome.storage.local.set(toSave, function() {
      return(true);
    });
  } catch (e){
    console.log("---- BEGIN chrome.storage.local.set failed");
    console.log(e);
    console.log(toSave);
    console.log("---- END chrome.storage.local.set failed");
  }
}

function getConfig(keys = [], callback){
  return chrome.storage.local.get(keys, callback);
}

function settingsUrl(){
  return chrome.extension.getURL("options.html")
}

function openSettings(){
  // this depends on our background.js, natch
  return chrome.runtime.sendMessage({verbthenoun: "options"}, function(response) {});
}
