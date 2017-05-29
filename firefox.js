$(document).ready(function() {

<%= content_script %>

  if(skip_domains.indexOf(window.location.hostname) < 0){
    walk(document.body);

    new MutationObserver(function() {
      walk(document.body);
    }).observe(document.body, {
      childList: true
    });
  }
});
