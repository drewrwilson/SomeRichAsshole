$(document).ready(function() {
  var actionStationsEndpoint = "https://pu2jh2b68k.execute-api.us-east-1.amazonaws.com/prod/ActionStations";
  var geoCodeEndpoint = "https://maps.googleapis.com/maps/api/geocode/json";
//  var radiusEndpoint = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
  var actionStationsVersion = chrome.runtime.getManifest().version;
  var locationPlaceholderOrig = "";
  var googleZip = null;
  var googleCountry = null;
  var global_disabled = false;
  var myLocales = [];
  var hoverTimeout;
  var themes = {
    "dradis": "&ohm;",
    "orange": "&#9762;",
    "snowflake": "&#10052;",
    "murica": "&#x0272A;",
    "pink": "&#x02764;",
    "red": "&#9773;"
  };
  $("body#actionstations-options-page h1.header span.version").html(actionStationsVersion);


  /*
   * Dev only: log changes to local storage variables.
   */
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
      var storageChange = changes[key];
/*      console.log('Storage key "%s" in namespace "%s" changed. ' +
                  'Old value was "%s", new value is "%s".',
                  key,
                  namespace,
                  storageChange.oldValue,
                  JSON.stringify(storageChange.newValue, null, " "));
 */
    }
  });

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

  function disabledHandler(disabled){
    setConfig("actionstations_disabled", disabled);
    if(disabled){
      $("body#actionstations-options-page input.actionstations-disable").prop("checked", true);
      $("body#actionstations-options-page input.actionstations-enable").prop("checked", false);
      $("body#actionstations-options-page div#actionstations-config-features").hide();
      $("body#actionstations-options-page div#actionstations-themes").hide();
      $("div#action-stations-widget").hide();
      global_disabled = true;
    } else {
      $("body#actionstations-options-page input.actionstations-disable").prop("checked", false);
      $("body#actionstations-options-page input.actionstations-enable").prop("checked", true);
      $("body#actionstations-options-page div#actionstations-config-features").show();
      $("body#actionstations-options-page div#actionstations-themes").show();
      $("div#action-stations-widget").show();
      optionCallback("actionstations_shrunk");
      optionCallback("actionstations_cache");
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
      $("div#action-stations-widget.action-stations-shrunk").hover(function(){
        if($(this).hasClass("action-stations-shrunk")){
          clearTimeout(hoverTimeout);
          $("div#action-stations-widget > div.action-stations-handle").fadeIn(200);
        }
      }, function(){
        hoverTimeout = setTimeout(function(){
          $("div#action-stations-widget > div.action-stations-handle").fadeOut(200);
        }, 1000);
      });
    } else {
      $("div#action-stations-widget > div.tcycle").fadeIn(400);
      $("div#action-stations-widget > a.action-stations-expand").fadeIn(400);
      $("div#action-stations-widget").removeClass("action-stations-shrunk");
      $("div#action-stations-widget").removeClass("action-stations-shrinkwrap-from-expanded");
      $("div#action-stations-widget > div.action-stations-handle").hide();
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
        console.log("ActionStations ache corrupted or too old, loading new actions");
        loadActions(); // this will call us again, with fresh data
      }
    } else {
      if(!cache){
        console.log("No ActionStations cache, loading new actions");
      } else {
        var cache_age = ((new Date()).getTime() - cache['cache_age'])/3600000;
        console.log("Expired ActionStations cache ("+cache_age+" hours), loading new actions");
      }
      loadActions(); // this will call us again, with fresh data
    }
    if(cache){
      cache['hide_urls'] = JSON.stringify(hidden_urls);
    }

    return(cache);
  }


  /*
   * Handle requests for, and saves, locale preferences.
   */
  function localeHandler(values, add = null, removeval = false){
    district = null;
    if(!values){
      values = [];
    }
    if(add){
      if(removeval){
        var idx = values.indexOf(add);
        if(idx >= 0){
          values.splice(idx, 1);
        }
      } else if(add.match(/^\d{5}(-\d{4})?/)){
        var zip = add.replace(/\-.*/, "");
        var parts = zip2district[zip].split(/-/);
        var state = postalCode2Name[parts[0]];
        values.push(zip2district[zip]);
        values.push(state);
      } else if(add.match(/^[A-Z]{2}\-\d{1,2}$/i)){
        var parts = add.toUpperCase().split(/-/);
        if(parts[1].length == 1){
          parts[1] = "0"+parts[1];
        }
        add = parts[0]+"-"+parts[1];
        var state = null;
        if(!postalCode2Name[parts[0]]){
          alert("Unknown district '"+add+"'");
          return;
        }
        state = postalCode2Name[parts[0]];
        found = false;
        for(var k in zip2district){
          if(add == zip2district[k]){
            found = true;
            break;
          }
        }
        if(!found){
          alert("Unknown district '"+add+"'");
          return;
        }
        values.push(state);
        values.push(add);
      } else if(add.match(/^[A-Z]{2}$/i)){
        if(!postalCode2Name[add.toUpperCase()]){
          alert("Unknown state '"+add.toUpperCase()+"'");
          return;
        }
        values.push(postalCode2Name[add.toUpperCase()]);
      } else if(add.match(/^[A-Z]{3,}$/i)){
        found = false;
        for(var k in postalCode2Name){
          if(add.toLowerCase() == postalCode2Name[k].toLowerCase()){
            values.push(postalCode2Name[k]);
            found = true;
            break;
          }
        }
        if(!found){
          alert("Unknown state '"+add+"'");
          return;
        }
      } else{
        alert("Locale '"+add+"' doesn't look like a zip code, a state, or a House district");
        return;
      }
      $("body#actionstations-options-page input#as-locale").val("");
    }
    myLocales = $.unique(values).sort();

    setConfig("actionstations_locale", myLocales);
    if(myLocales.length > 0){
      optionCallback("actionstations_actions_cache");
      $("div#as-locales").html("<strong>Displaying events for:</strong><br /><br/>");
      for(d = 0; d < myLocales.length; d++){
        var localeWrapper = document.createElement('div');
        $(localeWrapper).addClass("as-locale-saved");
        $(localeWrapper).html(myLocales[d]);
        $(localeWrapper).attr("locale", myLocales[d]);
        var localeDelete = document.createElement('span');
        $(localeDelete).html(" x");
        $(localeDelete).addClass("as-locale-saved-delete");
        $(localeWrapper).append(localeDelete);
        $("div#as-locales").append(localeWrapper);
      }
      $("button#as-guess-locale").hide();
      $("div#as-locales").show();
      $("body#actionstations-options-page span.as-locale-saved-delete").click(function(){
        var locale = $(this).parents("div.as-locale-saved").attr("locale");
        optionCallback("actionstations_locale", locale, null, true);

      });
    } else {
      $("button#as-guess-locale").show();
      $("div#as-locales").hide();
    }
  }

  /*
   * Update various DOM elements' class lists for the current theme.
   */
  function setTheme(theme){
    var themeselector = "div#action-stations-widget, div#action-stations-widget > div.tcycle a, div#action-stations-widget > div.action-stations-expanded a, div#action-stations-widget div.action-stations-expanded-head > h2, div.action-stations-expanded-head > a, div#action-stations-widget a.action-stations-shrinkwrap, div.action-stations-expanded a.action-stations-shrinkwrap-from-expanded, div#action-stations-widget div.action-stations-widget-linkwrapper, div#action-stations-widget > a.action-stations-expand, div#action-stations-widget > div.tcycle";
//    for (t=0; t<themes.length; t++){
    Object.keys(themes).forEach(function (t) {
      if (t == theme){
        $(themeselector).addClass("action-stations-"+t);
        $("div#action-stations-widget a.action-stations-shrinkwrap, div.action-stations-expanded a.action-stations-shrinkwrap-from-expanded").html(themes[t]);
      } else {
        $(themeselector).removeClass("action-stations-"+t);
      }
    });
  }

  function themeHandler(theme = null){
    if(!theme){
      theme = "dradis";
    }

    $("body#actionstations-options-page input.actionstations-theme").each(function(){
      if($(this).val() == theme){
        $(this).prop("checked", true);
      } else {
        $(this).prop("checked", false);
      }
    });
    setTheme(theme);
  }

  /*
   * Main wrapper for fetching/setting various local storage values.
   */
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
      } else if(key == "actionstations_locale"){
        localeHandler(items[key], setval, removeval);
        // if we're shrunk or disabled, make sure we don't overwrite that state
        optionCallback("actionstations_shrunk");
        optionCallback("actionstations_disabled");
      } else if(key == "actionstations_hints_seen"){
        if(items[key]){
          return;
        } 
        var hint = document.createElement('div');
        $(hint).addClass("action-stations-shrink-hint");
        var close = document.createElement('button');
        $(close).addClass("action-stations-shrink-hint-close");
        $(hint).html("This icon on the left minimizes the ActionStations widget</br>");
        $(close).html("Got it");
        $(hint).append(close);
        $("div#action-stations-widget").prepend(hint);
        $("div#action-stations-widget div.action-stations-shrink-hint").click(function(){
          setConfig(key, true);
          $("div#action-stations-widget div.action-stations-shrink-hint").remove();
        });
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
        // if we're shrunk or disabled, make sure we don't overwrite that state
        optionCallback("actionstations_shrunk");
        optionCallback("actionstations_disabled");
      } else if(key == "actionstations_disabled_defaultonstartup"){
        if(typeof(items[key]) === 'undefined'){
          setConfig(key, true);
          disabledHandler(true);
        }
      } else if(key == "actionstations_disabled"){
        if(setval != null){
          disabledHandler(setval);
        } else if(typeof(items[key]) !== 'undefined'){
          disabledHandler(items[key]);
        }
      } else if(key == "actionstations_theme"){
        if(setval != null){
          setConfig(key, setval);
          themeHandler(setval);
        } else {
          themeHandler(items[key]);
        }
        // if we're shrunk or disabled, make sure we don't overwrite that state
        optionCallback("actionstations_shrunk");
        optionCallback("actionstations_disabled");
      }
    });
  }

  optionCallback("actionstations_disabled");
  optionCallback("actionstations_actions_cache");

  function loadActions(expired = false){
    if(!$("div#action-stations-widget > div.action-stations-expanded").is(":visible")){
      $("div#action-stations-widget").removeClass("action-stations-shrunk");
      $("div#action-stations-widget > div.tcycle").show();
      $("div#action-stations-widget > div.tcycle").html("<a>Loading...</a>");
    }

    $.ajax({
      url: actionStationsEndpoint,
      type: "GET",
      statusCode:{
        500: function(xhr){
          die(xhr.responseText);
        }
      },
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
      var locale_match = true;
      if(myLocales &&
         item["Locale"] && item["Locale"].length > 0){
        locale_match = false;
        for(var q = 0; q < myLocales.length ; q++){
          if(item["Locale"].indexOf(myLocales[q]) >= 0){
            locale_match = true;
            break;
          }
        }
      }
      if(locale_match){
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
    }

    // disable tcycle if we're only showing one slide
    if(slide_count > 1){
      $("div#action-stations-widget > div.tcycle").tcycle();
      $("div#action-stations-widget > div.tcycle a").removeClass("noslide");
    } else {
      $("div#action-stations-widget > div.tcycle a").addClass("noslide");
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
      setConfig("actionstations_hints_seen", true);
      $("div#action-stations-widget div.action-stations-shrink-hint").remove();
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
    optionCallback("actionstations_hints_seen");

    if(expanded){
      $("div#action-stations-widget div.action-stations-shrink-hint").hide();
      $("div#action-stations-widget > div.tcycle").hide();
      $("div#action-stations-widget > div.action-stations-expanded").show();
      $("div#action-stations-widget > a.action-stations-expand").hide();
      $("div#action-stations-widget > a.action-stations-shrinkwrap").hide();
    } else if(standard){
      $("div#action-stations-widget div.action-stations-shrink-hint").show();
      $("div#action-stations-widget > div.tcycle").show();
      $("div#action-stations-widget > div.action-stations-expanded").hide();
      $("div#action-stations-widget > a.action-stations-expand").show();
      $("div#action-stations-widget > a.action-stations-shrinkwrap").show();
    } else {
      $("div#action-stations-widget div.action-stations-shrink-hint").hide();
      optionCallback("actionstations_shrunk")
    }
    $("div#action-stations-widget").css({'top': topPos, 'left' : "1em"});

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
  $("#actionstations-options-page input.actionstations-enable").change(function(){
    optionCallback("actionstations_disabled", !$(this).prop("checked"));
  });
  $("#actionstations-options-page input.actionstations-theme").change(function(){
    optionCallback("actionstations_theme", $(this).val());
  });

  if(!global_disabled){
    $(document).ajaxComplete(function(event, xhr, settings) {
      if(xhr.status != 200){
        try {
          var items = JSON.parse(xhr.responseText);
          if(items["message"]){
            $("div#action-stations-widget > div.tcycle a").html("[ActionStations: "+items["message"]+", try again later]");
          } else {
            throw new Error("nah");
          }
        } catch(e){
          $("div#action-stations-widget > div.tcycle a").html("[ActionStations: Error loading actions, try again later]");
        }
        throw new Error(xhr.status+" response from ActionStations gateway: "+xhr.responseText);
      }
      if(settings.url.match(/ActionStations/)){
        var newcache = {
          "cache_age": (new Date()).getTime(),
          "actions": xhr.responseText
        }
//      var items = JSON.parse(xhr.responseText);
        optionCallback("actionstations_actions_cache", newcache);
//      } else if(settings.url.match(/maps.googleapis.com\/maps\/api\/place\/nearbysearch/)) {
//        resp = JSON.parse(xhr.responseText);
      } else if(settings.url.match(/maps.googleapis.com\/maps\/api\/geocode/)) {
        $("body#actionstations-options-page input#as-locale").removeClass("fetching-zipcode");
        $("body#actionstations-options-page input#as-locale").prop("disabled", false);
        resp = JSON.parse(xhr.responseText);
        $("body#actionstations-options-page input#as-locale").attr("placeholder", locationPlaceholderOrig);
        if(!resp || !resp["results"] || resp["status"] != "OK"){
          alert("Couldn't find a USA zip code based on your location, you'll have to enter a location manually to use this feature.");
        } else {
          for(a=0; a<resp["results"].length; a++){
            if(googleCountry && googleZip){
              break;
            }
            var types = resp["results"][a]["types"];
            if(types.indexOf("street_address") >= 0){
              for(c=0; c<resp["results"][a]["address_components"].length; c++){
                var comp_types = resp["results"][a]["address_components"][c]["types"];
                if(comp_types.indexOf("postal_code") >= 0){
                  googleZip = resp["results"][a]["address_components"][c]["short_name"];
                }
                if(comp_types.indexOf("country") >= 0){
                  googleCountry = resp["results"][a]["address_components"][c]["short_name"];
                }
              }
            }
          }
          if(!googleZip || !googleCountry || googleCountry != "US"){
            alert("Couldn't find a USA zip code based on your location, you'll have to enter a location manually to use this feature.");
          } else {
            optionCallback("actionstations_locale", googleZip);
          }
        }
      }
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
      cancel: "div.tcycle > a, a.action-stations-expand, a.action-stations-retract, div.action-stations-widget-linkwrapper, a.action-stations-shrinkwrap",
      snap: false,
      cursor: "move",
      zIndex: 9999,
      containment: "div#action-stations-widget-box",
      stop: function(e, ui){
        hoverTimeout = setTimeout(function(){
          $("div#action-stations-widget > div.action-stations-handle").fadeOut(200);
        }, 1000);
      }
    });

    $(widget).css("z-index", 1000);
    $(slider).attr("data-fx", "scroll");
    $(slider).attr("data-speed", "1500");
    $(slider).attr("data-timeout", "6000");
    $(slider).addClass("tcycle");
    $(slider).addClass("noslide");
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
    var handle = document.createElement('div');
    $(handle).addClass("action-stations-handle");
    $(handle).html("&#x271B;");
    $(handle).hide();
    $(widget).prepend(handle);
    $(widget).hide();

    $('body').append(box);
    $(box).append(widget);
    setTheme("dradis");
    var topPos = $(window).height() - 60;
    $(widget).css({'top': topPos, 'left' : "1em"});
    $(window).resize(function() {
      var curTop = $("div#action-stations-widget").position().top;
      if(curTop > ($(window).height() - $("div#action-stations-widget").height())){
        topPos = $(window).height() - $("div#action-stations-widget").height()*2;
        $("div#action-stations-widget").css({'top': topPos, 'left' : "1em"});
      }
    });


    $(shrinkWrap).click(function(){
      setConfig("actionstations_hints_seen", true);
      $("div#action-stations-widget div.action-stations-shrink-hint").remove();
      if($("div#action-stations-widget").hasClass("action-stations-shrunk")){
        optionCallback("actionstations_shrunk", false)
      } else {
        optionCallback("actionstations_shrunk", true)
      }
    });

  }


  // Magic for auto-fetching someone's zipcode using the browser's geolocation
  // and Google's Map API.
  $("body#actionstations-options-page input#as-enter-locale").change(function(){
    optionCallback("actionstations_locale", $("body#actionstations-options-page input#as-enter-locale").val());
    $("body#actionstations-options-page input#as-enter-locale").val("");
  });
  $("body#actionstations-options-page input#as-enter-locale").keyup(function(e){
    if(e.keyCode == 13){
      optionCallback("actichangeonstations_locale", $("body#actionstations-options-page input#as-enter-locale").val());
      $("body#actionstations-options-page input#as-enter-locale").val("");
    }
  });

  $("body#actionstations-options-page button#as-guess-locale").click(function(){
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(pos){
        // Cool, we got some coordinates
        var curval = $("body#actionstations-options-page input#as-locale").val();
        if(!$("body#actionstations-options-page input#as-locale").hasClass("fetching-zipcode") && (curval == "" || !curval)){
          $("body#actionstations-options-page input#as-locale").addClass("fetching-zipcode");
          $("body#actionstations-options-page input#as-locale").prop("disabled", true);
          /*
          var meters = 20*1609.344; // take miles as a parameter
          $.ajax({
            url: radiusEndpoint+"?location="+pos.coords.latitude+","+pos.coords.longitude+"&radius="+meters+"&type=post_office&types=address&key="+googleAPIKey,
            type: "GET",
          });
          */

          $.ajax({
            url: geoCodeEndpoint+"?latlng="+pos.coords.latitude+","+pos.coords.longitude+"&sensor=false",
            type: "GET",
          });

          locationPlaceholderOrig = $("body#actionstations-options-page input#as-locale").attr("placeholder");
          $("body#actionstations-options-page input#as-locale").attr("placeholder", "...retrieving zip code from Google...");
        }
      },
      function(error){
        alert("Couldn't fetch your location for some reason. That's ok, youcan just enter it manually if you'd like to use this feature.");
      },
      {timeout: 10 * 1000});
    }
    else {
      console.log('Geolocation is not supported for this Browser/OS.');
    }
  });

  optionCallback("actionstations_locale");
  optionCallback("actionstations_disabled_defaultonstartup");

});
