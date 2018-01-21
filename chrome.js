$(document).ready(function() {

<%= content_script %>

  if(window.location.hostname != "wtfisastevebannon.com" && !window.location.href.match(/twitter\.com\/SteveBannonFcts/i)){
    walk(document.body);

    new MutationObserver(function() {
      walk(document.body);
    }).observe(document.body, {
      childList: true
    });
  }
});
