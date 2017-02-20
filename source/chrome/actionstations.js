$(document).ready(function() {

  var disabled = getConfig("disable-actionstations");
  var cache_age = getConfig("actionstations-cache-time");
  var shrunk = getConfig("actionstations-shrunk");
  var saved_actions = null;
  try {
    saved_actions = JSON.parse(getConfig("actionstations-actions"));
  } catch(e){
    saved_actions = null;
  }

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
    if($(checkbox).prop("checked")){
      $(myparent).addClass("action-stations-donechecked");
      $(myparent).next("div.action-stations-timeleft").addClass("action-stations-donechecked");
    } else {
      $(myparent).removeClass("action-stations-donechecked");
      $(myparent).next("div.action-stations-timeleft").removeClass("action-stations-donechecked");
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
      $(label).append("Done?");
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


  if(!disabled){
    $(document).ajaxComplete(function(event, xhr, settings) {
      saved_actions = JSON.parse(xhr.responseText);
      setWidgetText(saved_actions);
      cache_age = saveConfig("actionstations-cache-time", (new Date()).getTime());
      saveConfig("actionstations-actions", xhr.responseText)
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
    $(shrinkWrap).html("&#10052;");
    $(shrinkWrap).addClass("action-stations-shrinkwrap");
    $(expand).html("&#9858;");
    $(expand).addClass("action-stations-expand");
    $(expanded).addClass("action-stations-expanded");
    $(widget).append(shrinkWrap);
    $(widget).append(slider);
    $(widget).append(expand);
    $(widget).append(expanded);
    $(widget).hide();
    $(expanded).hide();

    $('body').append(widget);
    if(((new Date()).getTime() - cache_age) < 3600000){
      if(saved_actions && saved_actions["Items"]){
        setWidgetText(saved_actions);
      } else {
        loadActions();
      }
    } else {
      loadActions();
    }

    if(shrunk == 1){
      $(slider).hide();
      $(expand).hide();
      $("div#action-stations-widget").addClass("action-stations-shrunk");
    } else {
      $("div#action-stations-widget > div.tcycle").show();
    }
    $(shrinkWrap).click(function(){
      if(shrunk == 1){
        $("div#action-stations-widget > div.tcycle").fadeIn(400);
        $("div#action-stations-widget > span.action-stations-expand").fadeIn(400);
        $("div#action-stations-widget").removeClass("action-stations-shrunk");
        shrunk = saveConfig("actionstations-shrunk", 0);
      } else {
        $("div#action-stations-widget > div.tcycle").hide();
        $("div#action-stations-widget > span.action-stations-expand").hide();
        $("div#action-stations-widget").addClass("action-stations-shrunk");
        shrunk = saveConfig("actionstations-shrunk", 1);
      }
    });

  }
});
