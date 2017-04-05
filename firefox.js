(function() {

<%= content_script %>

  function windowLoadHandler() {
    // Dear Mozilla: I hate you for making me do this.
    if(skip_domains.indexOf(window.location.hostname) < 0){
      window.removeEventListener('load', windowLoadHandler);

      document.getElementById('appcontent').addEventListener('DOMContentLoaded', function(e) {
        walk(e.originalTarget.body);

        new MutationObserver(function() {
          walk(e.originalTarget.body);
        }).observe(e.originalTarget.body, {
          childList: true
        });
      });
    }
  }

  window.addEventListener('load', windowLoadHandler);
}());
