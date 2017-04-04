$(document).ready(function() {
  var createdPhrases = []
  var skip_domains = ["wtfisastevebannon.com"];

  function walk(node)
  {
    var child, next;
    
    switch ( node.nodeType )
    {
      case 1:  // Element
      case 9:  // Document
      case 11: // Document fragment
        if(node.tagName != "INPUT"){ // don't futz form inputs
          child = node.firstChild;
          while ( child )
          {
            next = child.nextSibling;
            walk(child);
            child = next;
          }
        }
        break;
      
      case 3: // Text node
          handleText(node);
        break;
    }
  }

  var foundtrumps = 0;
  var phrase = "";
  var mode = "";
  var insertCalls = 0;

  function replacer(match, p1, offset, string)
  {
    realprefix = "";
    realname = "";
    if(mode == "theDevilHimself"){
      if(match == "trump"){
        return("trump");
      }
      if(p1 && p1.length > 0){
        realprefix = p1;
      } else if(PHRASES["trumpisms_prefixable"].includes(phrase)){
        realprefix = "The";
      }
      realprefix = realprefix + " ";
    } else if(mode == "theDevilHimselfPostfix"){
      realprefix = phrase;
      phrase = p1;
    } else {
      string = offset;
      offset = p1;
    }

    if(match.match(/[A-Z]/) && !match.match(/[a-z]/)){
      phrase = phrase.toUpperCase();
      realprefix = realprefix.toUpperCase();
    } else if(match.match(/[a-z]/) && !match.match(/[A-Z]/)){
      phrase = phrase.toLowerCase();
      realprefix = realprefix.toLowerCase();
    }

    return(realprefix + phrase);
  }
  // This is a grotesque way of coping with a variable number of backreferences,
  // but that's Javascript for you.
  function replacer2(match, p1, p2, offset, string)
  {
    realprefix = "";
    realname = "";
    if(mode == "theDevilHimself"){
      realprefix = phrase
    }

    if(match.match(/[A-Z]/) && !match.match(/[a-z]/)){
      realprefix = realprefix.toUpperCase();
    } else if(match.match(/[a-z]/) && !match.match(/[A-Z]/)){
      realprefix = realprefix.toLowerCase();
    }

    return(realprefix + " " + p2);
  }

  function trumpCrotchDumplings(textNode)
  {
    var v = textNode.nodeValue;
    mode = "trumpCrotchDumplings";

    var allphrases = PHRASES["trumpisms_prefixable"].concat(PHRASES["trumpisms_nonprefixable"]);
    trumpphrase = allphrases[Math.floor(Math.random()*allphrases.length)];
    prefixed_trumpphrase = trumpphrase;
    if(PHRASES["trumpisms_prefixable"].includes(trumpphrase)){
      prefixed_trumpphrase = "The "+trumpphrase;
    }

    // The family get simpler patterns
    phrase = "Eric (the Beavis-y one), Son of "+prefixed_trumpphrase;
    v = v.replace(/(?:Eric )(?:(?:Frederick|F|F\.) )?Trump/i, replacer);
    phrase = "Donald Jr (the Butthead-y one), Son of "+prefixed_trumpphrase;
    v = v.replace(/(?:(?:Donald|Don) )(?:(?:John|J|J\.) )?Trump,? Jr\.?/i, replacer);
    phrase = "Ivanka \"Complicit\" Trump";
    v = v.replace(/Ivanka Trump/i, replacer);
    phrase = "Tiffany, Daughter of "+prefixed_trumpphrase;
    v = v.replace(/Tiffany Trump/i, replacer);

    phrase = "First Trophy Wife of "+prefixed_trumpphrase;
    v = v.replace(/Ivana Trump/i, replacer);
    phrase = "Second Trophy Wife of "+prefixed_trumpphrase;
    v = v.replace(/Marla Maples/i, replacer);
    phrase = "Third Trophy Wife of "+prefixed_trumpphrase;
    v = v.replace(/Melania Trump/i, replacer);


    if(textNode.nodeValue != v){
      createdPhrases.push(v);
      foundtrumps++;
      textNode.nodeValue = v;
    }

  }

  function theDevilHimself(textNode)
  {
    var v = textNode.nodeValue;
  //  var prefixes = ["some", "a", "the"];

    var allphrases = PHRASES["trumpisms_prefixable"].concat(PHRASES["trumpisms_nonprefixable"]);
    mode = "theDevilHimself";
    if(v.match(/trump/i)){
      // if his title and full name are present, swap the title with a
      // prefixable phrase, so you get things like "Ludicrous Tangerine Ballbag
      // Donald Trump signed an Executive Order..."
      phrase = PHRASES["trumpisms_prefixable"][Math.floor(Math.random()*PHRASES["trumpisms_prefixable"].length)];
      v = v.replace(/(mr\.|the|a|some|president|presidential candidate|candidate|president-elect)\s*((?:donald\s*)(?:(?:john|j|j\.)\s*)?\btrump)\b/gi, replacer2);

      phrase = allphrases[Math.floor(Math.random()*allphrases.length)];
      // If it's his title and last name, sub name with something that makes
      // grammatical sense alongside the 
      if(textNode.nodeValue == v && createdPhrases.indexOf(v) < 0){
        v = v.replace(/\b(mr\.|the|a|some|president|presidential candidate|candidate|president-elect)\s*(?:donald\s*)?(?:(?:john|j|j\.)\s*)?\btrump\b/gi, replacer);
      }

      // Show some hate for Trump Tower
      mode = "theDevilHimselfPostfix";
      if(textNode.nodeValue == v && createdPhrases.indexOf(v) < 0){
        v = v.replace(/\btrump(\s*tower)\b/gi, replacer);
      }

      // if it's just his name, swap that
      mode = "theDevilHimself";
      if(textNode.nodeValue == v && createdPhrases.indexOf(v) < 0){
        v = v.replace(/\b(?:donald\s*)?(?:(?:john|j|j\.)\s*)?\btrump\b/gi, replacer);
      }

      if(textNode.nodeValue != v) {
        createdPhrases.push(v);
      }
    }

    if(textNode.nodeValue != v){
      foundtrumps++;
      textNode.nodeValue = v
    }
  }

  function svengali(textNode)
  {
    var v = textNode.nodeValue;
    mode = "svengali";

    if(PHRASES["bannonisms"].length > 0){
      var bannonphrase = PHRASES["bannonisms"][Math.floor(Math.random()*PHRASES["bannonisms"].length)];
      var prebannon = v;
      if(createdPhrases.indexOf(prebannon) < 0){
        v = v.replace(/\b(?:(steve|steven|stephen)\s*)\s*(bannon)\b/i, "$1 \""+bannonphrase+"\" $2");
        if(v == prebannon){
          // his surname is relatively common, don't bank on it being right without the Steve if a Trump hasn't been mentioned
          if(foundtrumps > 0){
            v = v.replace(/\b((?:(?:steve|steven|stephen)\s*)?(?:(?:k\.)\s*)?\bbannon)\b(?!\s\()/i, "$1 ("+bannonphrase+")");
          } else {
            v = v.replace(/\b((?:(?:steve|steven|stephen)\s*)(?:(?:k\.)\s*)?\bbannon)\b(?!\s\(')/i, "$1 ("+bannonphrase+")");
          }
        }
        if(v != prebannon){
          PHRASES["bannonisms"].splice(PHRASES["bannonisms"].indexOf(bannonphrase), 1);
          textNode.nodeValue = v;
          createdPhrases.push(v);
        }
      }
    }
  }

  function handleText(textNode)
  {
    trumpCrotchDumplings(textNode);
    theDevilHimself(textNode);
    svengali(textNode);
  }

  if(skip_domains.indexOf(window.location.hostname) < 0){
    walk(document.body);

    new MutationObserver(function() {
      walk(document.body);
    }).observe(document.body, {
      childList: true
    });
  }

});
