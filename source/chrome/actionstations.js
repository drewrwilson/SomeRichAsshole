$(document).ready(function() {

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
      var storageChange = changes[key];
      console.log('Storage key "%s" in namespace "%s" changed. ' +
                  'Old value was "%s", new value is "%s".',
                  key,
                  namespace,
                  storageChange.oldValue,
                  JSON.stringify(storageChange.newValue, null, " "));
    }
  });

  var global_disabled = false;
  function disabledHandler(disabled){
console.log("disabled handler called with "+disabled);
    if(disabled){
      $("body#actionstations-options-page input.actionstations-disable").prop("checked", true);
      $("div#action-stations-widget").hide();
      global_disabled = true;
    } else {
      $("body#actionstations-options-page input.actionstations-disable").prop("checked", false);
      $("div#action-stations-widget").show();
      global_disabled = false;
    }
  }

  function shrinkHandler(shrunk){
    if(shrunk == true){
      $("div#action-stations-widget > div.tcycle").hide();
      $("div#action-stations-widget > span.action-stations-expand").hide();
      $("div#action-stations-widget span.action-stations-shrinkwrap").show();
      $("div#action-stations-widget > div.action-stations-expanded").hide();
      $("div#action-stations-widget").addClass("action-stations-shrunk");
      $("div#action-stations-widget").addClass("action-stations-shrinkwrap-from-expanded");
    } else {
      $("div#action-stations-widget > div.tcycle").fadeIn(400);
      $("div#action-stations-widget > span.action-stations-expand").fadeIn(400);
      $("div#action-stations-widget").removeClass("action-stations-shrunk");
      $("div#action-stations-widget").removeClass("action-stations-shrinkwrap-from-expanded");
    }
  }

  function cacheHandler(cache, hide_url = null, unhide_url = false){
    var hidden_urls = [];

    if(cache){
      if(cache['hide_urls']){
        hidden_urls = JSON.parse(cache['hide_urls']);
      }
      if(hide_url){
        if(!unhide_url){
          hidden_urls.push(hide_url);
        } else {
          var idx = hidden_urls.indexOf(hide_url);
          if (idx > -1) {
            hidden_urls.splice(idx);
          }
        }
        hidden_urls = $.uniqueSort(hidden_urls);
      }
    }

    if(cache && ((new Date()).getTime() - cache['cache_age']) < 3600000 && cache['actions']){
      var actions = JSON.parse(cache['actions']);

      if(actions && actions["Items"]){
        setWidgetText(actions, hidden_urls);
      } else {
        console.log("Cache corrupted or too old, loading new actions");
        loadActions(); // this will call us again, with fresh data
      }
    } else {
      if(!cache){
        console.log("No cache, loading new actions");
      } else {
        var cache_age = ((new Date()).getTime() - cache['cache_age'])/3600000;
        console.log("Expired cache ("+cache_age+" hours), loading new actions");
      }
      loadActions(); // this will call us again, with fresh data
    }
    if(cache){
      cache['hide_urls'] = JSON.stringify(hidden_urls);
    }

    return(cache);
  }


  function setConfig(key, val){
    var toSave = {};
    toSave[key] = val;
    chrome.storage.local.set(toSave, function() {
    });
  }

  function themeHandler(theme = null){
    if(!theme){
      theme = "murica";
    }
    // 9774= peace, 9770= star and crescent
    var themes = {
      "orange": "&#9762;",
      "snowflake": "&#10052;",
      "murica": "&#x0272A;",
      "pink": "&#x02764;",
      "red": "&#9773;"
    };
    console.log("themeHandler called: "+theme);
    $("body#actionstations-options-page input.actionstations-theme").each(function(){
      if($(this).val() == theme){
        $(this).prop("checked", true);
      } else {
        $(this).prop("checked", false);
      }
    });
    var themeselector = "div#action-stations-widget, div#action-stations-widget > div.tcycle a, div#action-stations-widget > div.action-stations-expanded a, div.action-stations-expanded-head > h2, div.action-stations-expanded-head > span, div#action-stations-widget span.action-stations-shrinkwrap, div.action-stations-expanded span.action-stations-shrinkwrap-from-expanded";
//    for (t=0; t<themes.length; t++){
    Object.keys(themes).forEach(function (t) {
      if (t == theme){
        console.log("Setting ActionStations color scheme to action-stations-"+t);
        $(themeselector).addClass("action-stations-"+t);
        $("div#action-stations-widget span.action-stations-shrinkwrap, div.action-stations-expanded span.action-stations-shrinkwrap-from-expanded").html(themes[t]);
      } else {
        $(themeselector).removeClass("action-stations-"+t);
      }
    });
  }

  // XXX nah, gotta integrate this with the cache
  function optionCallback(key, setval = null, hide_url = null, removeval = false){
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
        if(setval != null || hide_url != null){
          newcache = cacheHandler(setval, hide_url, removeval);
          setConfig(key, newcache);
        }
        cacheHandler(items[key]);
      } else if(key == "actionstations_disabled"){
        if(setval != null){
          disabledHandler(setval);
        } else {
          disabledHandler(items[key]);
        }
      } else if(key == "actionstations_theme"){
        if(setval != null){
          setConfig(key, setval);
          themeHandler(setval);
        } else {
          themeHandler(items[key]);
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
      optionCallback("actionstations_actions_cache", null, url, false);
    } else {
      optionCallback("actionstations_actions_cache", null, url, true);
    }
  }

  function setWidgetText(jsonresp, hidden_urls = []){
    $("div#action-stations-widget > div.tcycle").html("");
    $("div#action-stations-widget > div.tcycle").off();
    $("div.action-stations-expanded").html("");
    var expanded_head = document.createElement('div');
    var expanded_head_text = document.createElement('h2');
    var shrinkWrap = document.createElement('span');
    var settingsButton = document.createElement("a");
    $(shrinkWrap).addClass("action-stations-shrinkwrap-from-expanded");
    $(expanded_head_text).text(" #resist: Action Stations");
    $(expanded_head_text).prepend(shrinkWrap);
    $(expanded_head_text).append(settingsButton);
    $(expanded_head).addClass("action-stations-expanded-head");
    $(expanded_head).append(expanded_head_text);
    $(settingsButton).html("&#9881;");
    $(settingsButton).addClass("action-stations-settings-button");
    settingsButton.title = "Settings";
    settingsButton.href = "chrome-extension://iakjefalhkkcomjjknimjicfhbnoadmc/options.html";
    settingsButton.target = "_blank";
    $(expanded_head_text).prepend(settingsButton);

    var retract = document.createElement('span');
    $(retract).html("&#9858;");
    $(retract).addClass("action-stations-retract");
    $(expanded_head).append(retract);
    $("div.action-stations-expanded").append(expanded_head);
    $("div.action-stations-widget-linkwrapper").html("");
    var slide_count = 0;
    for (var i = 0; i < jsonresp["Items"].length; i++){
      $(slider).hide();
      var item = jsonresp["Items"][i];

      var hidden_ent = hidden_urls.indexOf(item["URL"]);
      var aTag = document.createElement('a');
      aTag.setAttribute('href', item["URL"]);
      aTag.setAttribute('target', "_blank");
      $(aTag).html(item["Description"]);
      if(hidden_ent < 0){
        slide_count++;
        $("div#action-stations-widget > div.tcycle").append(aTag);
      }

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
      if(hidden_ent >= 0){
        $(timeLeft).addClass("action-stations-donechecked");
        $(linkWrapper).addClass("action-stations-donechecked");
        $(checkBox).prop("checked", true);
      }
      $("div#action-stations-widget > div.action-stations-expanded").append(timeLeft);
    }
    if(slide_count > 1){
      $("div#action-stations-widget > div.tcycle").tcycle();
    } else {
      $("div#action-stations-widget > div.tcycle a").css("padding", "0px");
    }

    $("div#action-stations-widget").fadeIn(800);
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

    $(shrinkWrap).click(function(){
      if($("div#action-stations-widget").hasClass("action-stations-shrinkwrap-from-expanded")){
        optionCallback("actionstations_shrunk", false)
      } else {
        optionCallback("actionstations_shrunk", true)
      }
    });

    $("div#action-stations-widget div.action-stations-widget-linkwrapper input").change(function(){
      handleDone(this);
    });
    $("div#action-stations-widget div.action-stations-widget-linkwrapper div.action-stations-done").click(function(){
      var checkBox = $(this).parent().find("input");
      if($(checkBox).prop("checked")){
        $(checkBox).prop("checked", false);
      } else {
        $(checkBox).prop("checked", true);
      }
      handleDone(checkBox);
    });

    optionCallback("actionstations_theme");
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

  $("#actionstations-options-page input.actionstations-disable").change(function(){
    optionCallback("actionstations_disabled", $(this).prop("checked"));
  });
  $("#actionstations-options-page input.actionstations-theme").change(function(){
    optionCallback("actionstations_theme", $(this).val());
  });

  if(!global_disabled){
    $(document).ajaxComplete(function(event, xhr, settings) {
      var newcache = {
        "cache_age": (new Date()).getTime(),
        "actions": xhr.responseText
      }
      var items = JSON.parse(xhr.responseText);
      optionCallback("actionstations_actions_cache", newcache);
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
    $(shrinkWrap).addClass("action-stations-shrinkwrap");
    $(shrinkWrap).html("&#10052;");
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
