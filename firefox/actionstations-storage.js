/*
 * Storage plugin: Chrome flavor
 */

function actionstationsTooltip(text, bgcolor){
  try {
    browser.browserAction.setBadgeText({"text":text.toString()});
    browser.browserAction.setBadgeBackgroundColor({"color":bgcolor});
  } catch (e) {
    if(actionStationsDebug){
      console.log("Can't set Chrome badge tooltip. Probably called from a page context. S'ok");
    }
  }
}

function actionStationsURLOf(asset){
  return(browser.extension.getURL(asset));
}

function actionStationsVersion(){
  return(browser.runtime.getManifest().version);
}

/*
 * Dev only: log changes to local storage variables.
 */
function bindStorageListeners(){
  browser.storage.onChanged.addListener(function(changes, namespace) {
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
    browser.storage.local.set(toSave, function() {
      return(true);
    });
  } catch (e){
    console.log("---- BEGIN browser.storage.local.set failed");
    console.log(e);
    console.log(toSave);
    console.log("---- END browser.storage.local.set failed");
  }
}

function getConfig(keys = [], callback){
  return browser.storage.local.get(keys, callback);
}

function settingsUrl(){
  return browser.extension.getURL("options.html")
}

function openSettings(){
  console.log("CALL TO OPENSETTINGS() UGH WHY DAMMIT");

//  var opening = browser.runtime.openOptionsPage();
//  opening.then(onOpened, onError);
return chrome.runtime.sendMessage({verbthenoun: "options"}, function(response) {});
}
