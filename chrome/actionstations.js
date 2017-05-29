$(document).ready(function() {
  var skip_domains = ["actionstations.network"]; // XXX this is cheap and won't help if it's embedded in some random site

  if(skip_domains.indexOf(window.location.hostname) < 0){
    bindStorageListeners();
    generateDOMElements();
    bindLocationHandlers();
    bindMiscellaneous();
  
    invokeHandler("actionstations_disabled");
    invokeHandler("actionstations_hints_seen");
    invokeHandler("actionstations_locale");
  }
});
