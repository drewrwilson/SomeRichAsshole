  var actionStationsEndpoint = "https://pu2jh2b68k.execute-api.us-east-1.amazonaws.com/prod/ActionStations";
  var geoCodeEndpoint = "https://maps.googleapis.com/maps/api/geocode/json";
  var myLocales = [];
  var actionStationsDebug = false;
  var features = ["expanded", "themeable", "locale", "fullcache", "fullscreen", "seen-unseen"];
  var actionStationsContainerId = "action-stations-widget";
  var themes = {
    "dradis": "&ohm;",
    "orange": "&#9762;",
    "snowflake": "&#10052;",
    "murica": "&#x0272A;",
    "pink": "&#x02764;",
    "red": "&#9773;"
  };
  var themeReverseIcons = ["dradis", "orange", "red"];
