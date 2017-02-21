$(document).ready(function() {
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
      var storageChange = changes[key];
      console.log('Storage key "%s" in namespace "%s" changed. ' +
                  'Old value was "%s", new value is "%s".',
                  key,
                  namespace,
                  storageChange.oldValue,
                  storageChange.newValue);
    }
  });

  var global_disabled = false;
  function disabledHandler(disabled){
    if(disabled){
      $("div#action-stations-widget").hide();
      global_disabled = true;
    } else {
      $("div#action-stations-widget").show();
      global_disabled = false;
    }
  }

  function shrinkHandler(shrunk){
    if(shrunk == true){
      $("div#action-stations-widget > div.tcycle").hide();
      $("div#action-stations-widget > span.action-stations-expand").hide();
      $("div#action-stations-widget").addClass("action-stations-shrunk");
    } else {
      $("div#action-stations-widget > div.tcycle").fadeIn(400);
      $("div#action-stations-widget > span.action-stations-expand").fadeIn(400);
      $("div#action-stations-widget").removeClass("action-stations-shrunk");
    }
  }

  function cacheHandler(cache){
    if(cache && ((new Date()).getTime() - cache['cache_age']) < 3600000 && cache['actions']){
      var actions = JSON.parse(cache['actions']);
      if(actions && actions["Items"]){
        console.log("Cache hit, using "+actions["Items"].length+" cached items");
        setWidgetText(actions);
      } else {
        console.log(cache);
        console.log("Cache corrupted or too old, loading new actions");
        loadActions();
      }
    } else {
      if(!cache){
        console.log("No cache, loading new actions");
      } else {
        console.log("Expired cache, loading new actions");
      }
      loadActions();
    }
    optionCallback("actionstations_skip_urls");
  }

  function setConfig(key, val){
    var toSave = {};
    toSave[key] = val;
    chrome.storage.local.set(toSave, function() {
    });
  }

  function skipHandler(urls, url, remove = false){
    if(!urls){
      urls = [];
    }
    if(url){
      if(!remove){
        urls.push(url);
      } else {
        var idx = urls.indexOf(url);
        if (idx > -1) {
          urls.splice(idx);
        }
      }
    }
    $("div.action-stations-expanded div.action-stations-widget-linkwrapper").each(function(){
      var url = $(this).find("a").attr("href");
      var idx = urls.indexOf(url);
      var checkbox = $(this).find("input[type='checkbox']");
      if (idx > -1) {
        $(this).next("div.action-stations-timeleft").addClass("action-stations-donechecked");// XXX no worky, why?
        $(this).addClass("action-stations-donechecked");
        $(checkbox).prop("checked", true);
      } else {
        $(this).next("div.action-stations-timeleft").removeClass("action-stations-donechecked");// XXX no worky, why?
        $(this).removeClass("action-stations-donechecked");
        $(checkbox).prop("checked", false);
      }
    });
    $("div#action-stations-widget > div.tcycle > a").each(function(){
      var url = $(this).attr("href");
      console.log("Should I hide "+url+"?");
      var idx = urls.indexOf(url);
      if (idx > -1) {
      console.log("YES"); // XXX need to make this cooperate with tcycle somehow
        $(this).hide();
      } else {
        $(this).show();
      }
    });
    return(urls);
  }

  function optionCallback(key, setval = null, removeval = false){
    chrome.storage.local.get([key], function(items) {
      if(key == "actionstations_shrunk"){
        if(items[key] == 1){
          items[key] = true;
        }
        if(setval != null){
          setConfig(key, setval);
          shrinkHandler(setval);
        } else {
          shrinkHandler(items[key]);
        }
      } else if(key == "actionstations_actions_cache"){
        cacheHandler(items[key]);
      } else if(key == "actionstations_disabled"){
        disabledHandler(items[key]);
      } else if(key == "actionstations_skip_urls"){
        var newurls = skipHandler(items[key], setval, removeval);
        if(setval){
          setConfig(key, newurls);
        }
      }
    });
  }

  optionCallback("actionstations_disabled");
  optionCallback("actionstations_actions_cache");

  function loadActions(expired = false){
    $.ajax({
      url:"https://pu2jh2b68k.execute-api.us-east-1.amazonaws.com/prod/ActionStations",
      type: "GET",
      data: { "expired": expired },
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  function timeString(expiration){
    var now = (new Date()).getTime();
    var left = (expiration - now)/1000;
    if(left/86400 > 1){
      return(parseInt(left/86400)+" days left");
    } else if(parseInt(left/86400) == 1){
      return("1 day left");
    } else {
      if(left/3600 > 3){
        return(parseInt(left/3600)+" hours left");
      } else {
        return("Minutes to go");
      }
    }
  }

  function handleDone(checkbox){
    var myparent = $(checkbox).parents("div.action-stations-widget-linkwrapper");
    var url = $(myparent).find("a").attr("href");
    if($(checkbox).prop("checked")){
      optionCallback("actionstations_skip_urls", url, false)
    } else {
      optionCallback("actionstations_skip_urls", url, true)
    }
  }

  function setWidgetText(jsonresp){
    $("div#action-stations-widget > div.tcycle").html("");
    $("div.action-stations-expanded").html("");
    var expanded_head = document.createElement('div');
    var expanded_head_text = document.createElement('h2');
    $(expanded_head_text).text("Action Stations: #resist");
    $(expanded_head).addClass("action-stations-expanded-head");
    $(expanded_head).append(expanded_head_text);
    var retract = document.createElement('span');
    $(retract).html("&#9858;");
    $(retract).addClass("action-stations-retract");
    $(expanded_head).append(retract);
    $("div.action-stations-expanded").append(expanded_head);
    $("div.action-stations-widget-linkwrapper").html("");
    for (var i = 0; i < jsonresp["Items"].length; i++){
      $(slider).hide();
      var item = jsonresp["Items"][i];
      var aTag = document.createElement('a');
      aTag.setAttribute('href', item["URL"]);
      aTag.setAttribute('target', "_blank");
      $(aTag).html(item["Description"]);
      $("div#action-stations-widget > div.tcycle").append(aTag);

      var linkWrapper = document.createElement('div');
      $(linkWrapper).addClass("action-stations-widget-linkwrapper");
      var fullLink = aTag.cloneNode();
      fullLink.innerHTML = item["Description"];
      $(linkWrapper).append(fullLink);

      var label = document.createElement('div');
      $(label).addClass("action-stations-done");
      var checkBox = document.createElement('input');
      $(checkBox).attr('type', "checkbox");
      $(label).append(checkBox);
      $(label).append(" skip/done");
      $(linkWrapper).append(label);

      $("div#action-stations-widget > div.action-stations-expanded").append(linkWrapper);

      var timeLeft = document.createElement('div');
      $(timeLeft).addClass("action-stations-timeleft");
      $(timeLeft).text(timeString(item["Expiration"]*1000));
      $("div#action-stations-widget > div.action-stations-expanded").append(timeLeft);
    }
    $("div#action-stations-widget").fadeIn(800);
    $("div#action-stations-widget > div.tcycle").tcycle();
    $("div#action-stations-widget span.action-stations-expand").click(function(){
      $("div#action-stations-widget > div.tcycle").hide();
      $("div#action-stations-widget > div.action-stations-expanded").fadeIn(200);
      $("div#action-stations-widget > span.action-stations-expand").hide();
      $("div#action-stations-widget > span.action-stations-shrinkwrap").hide();

    });
    $("div#action-stations-widget span.action-stations-retract").click(function(){
      $("div#action-stations-widget > div.action-stations-expanded").hide();
      $("div#action-stations-widget > div.tcycle").fadeIn(200);
      $("div#action-stations-widget > span.action-stations-expand").show();
      $("div#action-stations-widget > span.action-stations-shrinkwrap").show();

    });

    $("div#action-stations-widget div.action-stations-widget-linkwrapper input").change(function(){
      handleDone(this);
    });
  }

  /*
  function getFormattedDate(date) {
    var year = date.getFullYear();
    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    return month + '/' + day + '/' + year;
  }
   */


  if(!global_disabled){
    $(document).ajaxComplete(function(event, xhr, settings) {
      saved_actions = JSON.parse(xhr.responseText);
      setWidgetText(saved_actions);
      newcache = {
        "cache_age": (new Date()).getTime(),
        "actions": xhr.responseText
      }
      setConfig("actionstations_actions_cache", newcache)
    });

    var widget = document.createElement('div');
    var slider = document.createElement('div');
    var shrinkWrap = document.createElement('span');
    var expand = document.createElement('span');
    var expanded = document.createElement('div');
    $(widget).attr("id", "action-stations-widget");
    $(slider).attr("data-fx", "scroll");
    $(slider).attr("data-speed", "1500");
    $(slider).attr("data-timeout", "6000");
    $(slider).addClass("tcycle");
    $(slider).hide();
    $(shrinkWrap).html("&#10052;");
    $(shrinkWrap).addClass("action-stations-shrinkwrap");
    $(expand).html("&#9858;");
    $(expand).addClass("action-stations-expand");
    $(expand).hide();
    $(expanded).addClass("action-stations-expanded");
    $(expanded).hide();
    $(widget).append(shrinkWrap);
    $(widget).append(slider);
    $(widget).append(expand);
    $(widget).append(expanded);
    $(widget).addClass("action-stations-shrunk");
    $(widget).hide();

    $('body').append(widget);

    $(shrinkWrap).click(function(){
      if($("div#action-stations-widget").hasClass("action-stations-shrunk")){
        optionCallback("actionstations_shrunk", false)
      } else {
        optionCallback("actionstations_shrunk", true)
      }
    });

    optionCallback("actionstations_shrunk");

  }
});
