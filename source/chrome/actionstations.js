$(document).ready(function() {
  var actionStationsVersion = chrome.runtime.getManifest().version;
  $("body#actionstations-options-page h1.header span.version").html(actionStationsVersion);

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
      if(pre_expand_loc && post_expand_loc && post_expand_loc.top == $("div#action-stations-widget").position().top){
        $("div#action-stations-widget").css({'top': pre_expand_loc.top, 'left' : post_expand_loc.left});
        pre_expand_loc = post_expand_loc = null;
      }
      $("div#action-stations-widget > div.tcycle").hide();
      $("div#action-stations-widget > a.action-stations-expand").hide();
      $("div#action-stations-widget a.action-stations-shrinkwrap").show();
      $("div#action-stations-widget > div.action-stations-expanded").hide();
      $("div#action-stations-widget").addClass("action-stations-shrunk");
      $("div#action-stations-widget").addClass("action-stations-shrinkwrap-from-expanded");
    } else {
      $("div#action-stations-widget > div.tcycle").fadeIn(400);
      $("div#action-stations-widget > a.action-stations-expand").fadeIn(400);
      $("div#action-stations-widget").removeClass("action-stations-shrunk");
      $("div#action-stations-widget").removeClass("action-stations-shrinkwrap-from-expanded");
    }
  }

  function cacheHandler(cache, hide_url = null, unhide_url = false){

    var hidden_urls = [];
    if(cache && cache['hide_urls']){
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
    }
    if(cache){
      cache['hide_urls'] = JSON.stringify($.uniqueSort(hidden_urls));
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
      "dradis": "&ohm;",
      "orange": "&#9762;",
      "snowflake": "&#10052;",
      "murica": "&#x0272A;",
      "pink": "&#x02764;",
      "red": "&#9773;"
    };

    $("body#actionstations-options-page input.actionstations-theme").each(function(){
      if($(this).val() == theme){
        $(this).prop("checked", true);
      } else {
        $(this).prop("checked", false);
      }
    });
    var themeselector = "div#action-stations-widget, div#action-stations-widget > div.tcycle a, div#action-stations-widget > div.action-stations-expanded a, div#action-stations-widget div.action-stations-expanded-head > h2, div.action-stations-expanded-head > a, div#action-stations-widget a.action-stations-shrinkwrap, div.action-stations-expanded a.action-stations-shrinkwrap-from-expanded, div#action-stations-widget div.action-stations-widget-linkwrapper, div#action-stations-widget > a.action-stations-expand";
//    for (t=0; t<themes.length; t++){
    Object.keys(themes).forEach(function (t) {
      if (t == theme){
        console.log("Setting ActionStations color scheme to action-stations-"+t);
        $(themeselector).addClass("action-stations-"+t);
        $("div#action-stations-widget a.action-stations-shrinkwrap, div.action-stations-expanded a.action-stations-shrinkwrap-from-expanded").html(themes[t]);
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
          if(setval == null){
            setval = items[key];
          }
          newcache = cacheHandler(setval, hide_url, removeval);
          setConfig(key, newcache);
        } else {
          cacheHandler(items[key]);
        }
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

  var pre_expand_loc = null;
  var post_expand_loc = null;
  function setWidgetText(jsonresp, hidden_urls = []){
    var expanded = false;
    var standard = false;
    if($("div#action-stations-widget > div.action-stations-expanded").is(":visible")){
      expanded = true;
    } else if($("div#action-stations-widget > div.tcycle").is(":visible")){
      standard =  true;
    }

    $("div#action-stations-widget > div.tcycle").html("");
    $("div#action-stations-widget > div.tcycle").hide();
    $("div#action-stations-widget > div.tcycle").off();
    $("div.action-stations-expanded").html("");
    $("div.action-stations-expanded").hide();
    var expanded_head = document.createElement('div');
    var expanded_head_text = document.createElement('h2');
    var shrinkWrap = document.createElement('a');
    var settingsButton = document.createElement("a");
    $(shrinkWrap).addClass("action-stations-shrinkwrap-from-expanded");
    shrinkWrap.title = "Shrink ActionStations";
    $(expanded_head_text).text(" #resist: Action Stations");
    $(expanded_head_text).prepend(shrinkWrap);
    $(expanded_head_text).append(settingsButton);
    $(expanded_head).addClass("action-stations-expanded-head");
    $(expanded_head).append(expanded_head_text);
    $(settingsButton).html("&#9881;");
    $(settingsButton).addClass("action-stations-settings-button");
    settingsButton.title = "ActionStations Settings";
    settingsButton.href = chrome.extension.getURL("options.html");
    settingsButton.target = "_blank";
    $(expanded_head_text).prepend(settingsButton);

    var retract = document.createElement('a');
    $(retract).html("&swarr;");
    retract.title = "Hide Details";
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

      var donebox = document.createElement('div');
      var label = document.createElement('span');
      $(label).html(" skip/done");
      $(donebox).addClass("action-stations-done");
      var checkBox = document.createElement('input');
      $(checkBox).attr('type', "checkbox");
      $(donebox).append(checkBox);
      $(donebox).append(label);
      $(linkWrapper).append(donebox);

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

    // disable tcycle if we're only showing one slide
    if(slide_count > 1){
      $("div#action-stations-widget > div.tcycle").tcycle();
    } else {
      $("div#action-stations-widget > div.tcycle a").css("padding", "0px");
    }

    $("div#action-stations-widget").fadeIn(800);
    $("div#action-stations-widget a.action-stations-expand").click(function(){
      var box_height = $("div#action-stations-widget-box").height();
      var widget_height = $("div#action-stations-widget").height();
      var widget_loc = $("div#action-stations-widget").position();
      pre_expand_loc = widget_loc;
      $("div#action-stations-widget > div.tcycle").hide();
      $("div#action-stations-widget > div.action-stations-expanded").fadeIn(200);
      var exp_height = $("div#action-stations-widget > div.action-stations-expanded").height();
      if((widget_loc.top + exp_height) > box_height){
        var diff = (exp_height - widget_height)+10;
        $("div#action-stations-widget").css({'top': widget_loc.top-diff, 'left' : widget_loc.left});
      }
      post_expand_loc = $("div#action-stations-widget").position();
      $("div#action-stations-widget > a.action-stations-expand").hide();
      $("div#action-stations-widget > a.action-stations-shrinkwrap").hide();

    });
    $("div#action-stations-widget a.action-stations-retract").click(function(){
      // if we have moved since last time, restore the smaller widget to its
      // previous location
      if(pre_expand_loc && post_expand_loc && post_expand_loc.top == $("div#action-stations-widget").position().top){
        $("div#action-stations-widget").css({'top': pre_expand_loc.top, 'left' : post_expand_loc.left});
        pre_expand_loc = post_expand_loc = null;
      }
      $("div#action-stations-widget > div.tcycle").fadeIn(200);
      $("div#action-stations-widget > div.action-stations-expanded").hide();
      $("div#action-stations-widget > a.action-stations-expand").show();
      $("div#action-stations-widget > a.action-stations-shrinkwrap").show();

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
    $("div#action-stations-widget div.action-stations-widget-linkwrapper div.action-stations-done span").click(function(){
      var checkBox = $(this).parent().find("input");
      if($(checkBox).prop("checked")){
        $(checkBox).prop("checked", false);
      } else {
        $(checkBox).prop("checked", true);
      }
      handleDone(checkBox);
    });

    $("div#action-stations-widget > div.action-stations-expanded").append(timeLeft);

    if(expanded){
      $("div#action-stations-widget > div.tcycle").hide();
      $("div#action-stations-widget > div.action-stations-expanded").show();
      $("div#action-stations-widget > a.action-stations-expand").hide();
      $("div#action-stations-widget > a.action-stations-shrinkwrap").hide();
    } else if(standard){
      $("div#action-stations-widget > div.tcycle").show();
      $("div#action-stations-widget > div.action-stations-expanded").hide();
      $("div#action-stations-widget > a.action-stations-expand").show();
      $("div#action-stations-widget > a.action-stations-shrinkwrap").show();
    } else {
      optionCallback("actionstations_shrunk")
    }

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
//      var items = JSON.parse(xhr.responseText);
      optionCallback("actionstations_actions_cache", newcache);
    });

    var widget = document.createElement('div');
    var box = document.createElement('div');
    var slider = document.createElement('div');
    var shrinkWrap = document.createElement('a');
    var expand = document.createElement('a');
    var expanded = document.createElement('div');
    $(box).attr("id", "action-stations-widget-box");
    $(widget).attr("id", "action-stations-widget");
    $(widget).draggable({
//      cancel: "div.tcycle > a, a.action-stations-expand, a.action-stations-retract, div.action-stations-widget-linkwrapper",
      snap: false,
//      opacity: 0.7,
//      helper: "clone",
      containment: "div#action-stations-widget-box"
    });
    $(slider).attr("data-fx", "scroll");
    $(slider).attr("data-speed", "1500");
    $(slider).attr("data-timeout", "6000");
    $(slider).addClass("tcycle");
    $(slider).hide();
    $(shrinkWrap).addClass("action-stations-shrinkwrap");
    shrinkWrap.title = "Shrink ActionStations";
    $(shrinkWrap).html("&ohm;");
    $(expand).html("&nearr;");
    expand.title = "Show Details";
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

    $('body').append(box);
    $(box).append(widget);
    var topPos = $(box).height() - $(widget).height()*4;
    $(widget).css({'top': topPos, 'left' : "1em"});

    $(shrinkWrap).click(function(){
      if($("div#action-stations-widget").hasClass("action-stations-shrunk")){
        optionCallback("actionstations_shrunk", false)
      } else {
        optionCallback("actionstations_shrunk", true)
      }
    });
  }
});
