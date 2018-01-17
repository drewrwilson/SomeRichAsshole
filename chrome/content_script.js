$(document).ready(function() {

  var trumpedPhrases = []
  var bannonedPhrases = []
  var bannon_no_possessive = new RegExp("bannon(?!['’]s)", "i");
  var fullname = "\\b((?:steve|steven|stephen)\\s*(?:k\\.?)?\\s*bannon)";
  var bannon_full = new RegExp(fullname, "i");
  var bannon_full_punct = new RegExp(fullname+"\\s?(?:[.,?\\-!\":(]|$)", "i");
  var bannon_last_punct = new RegExp("(bannon)\\s?([.,?\\-!\":(]|$)", "i");
  var bannon_full_space = new RegExp(fullname+"\\s", "i");
  var bannon_last_space = new RegExp("(bannon)\\s", "i");

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
  var foundbannons = 0;
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
      trumpedPhrases.push(v);
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
      // grammatical sense alongside "the"
      if(textNode.nodeValue == v && trumpedPhrases.indexOf(v) < 0){
        v = v.replace(/\b(the [a-z]+ |pro-|anti-|mr\.|the|a|some|president|presidential candidate|candidate|president-elect)\s*(?:donald\s*)?(?:(?:john|j|j\.)\s*)?\btrump\b/gi, replacer);
      }

      // Show some hate for Trump Tower
      mode = "theDevilHimselfPostfix";
      if(textNode.nodeValue == v && trumpedPhrases.indexOf(v) < 0){
        v = v.replace(/\btrump(\s*tower)\b/gi, replacer);
      }

      // if it's just his name, swap that
      mode = "theDevilHimself";
      if(textNode.nodeValue == v && trumpedPhrases.indexOf(v) < 0){
        v = v.replace(/\b(?:donald\s*)?(?:(?:john|j|j\.)\s*)?\btrump\b/gi, replacer);
      }

      if(textNode.nodeValue != v) {
        trumpedPhrases.push(v);
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
    // try to skip things that look like code
    if(v.match(/};/) && v.match(/\bvar /)){
      return;
    }

    if(PHRASES["bannonisms"].length > 0){
      var bannonphrase = PHRASES["bannonisms"][Math.floor(Math.random()*PHRASES["bannonisms"].length)];
      if(bannonphrase.match(/^(was|has|does)/)){
        bannonphrase = "who "+bannonphrase;
      } else if(!bannonphrase.match(/^(who|the)/)){
        bannonphrase = "who is "+bannonphrase;
      }
      var prebannon = v;
      if(bannonedPhrases.indexOf(prebannon) < 0){
        if(v.match(bannon_no_possessive)){
          if(v.match(bannon_full_punct)){
            v = v.replace(bannon_full, "$1, "+bannonphrase);
            foundbannons++;
          } else if(v.match(bannon_full_space)){
            v = v.replace(bannon_full, "$1- "+bannonphrase+"- ");
            foundbannons++;
          } else if(foundtrumps > 0 || foundbannons > 0) {
            if(v.match(bannon_last_punct)){
              v = v.replace(bannon_last_punct, "$1, "+bannonphrase+"$2");
            } else if(v.match(bannon_last_space)){
              v = v.replace(bannon_last_space, "$1- "+bannonphrase+"- ");
            }
          } else {
            console.log("UNCAUGHT MATCH OF STEVE BANNON: "+v);
          }
//      } else if(v.match(/bannon/i)) { // XXX eh, just skip it
//        console.log("FOUND A BANNON WITH APOSTROPHE-S: "+v);
        }
        if(v != prebannon){
          PHRASES["bannonisms"].splice(PHRASES["bannonisms"].indexOf(bannonphrase), 1);
          textNode.nodeValue = v;
          bannonedPhrases.push(v);
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


  if(window.location.hostname != "wtfisastevebannon.com" && !window.location.href.match(/twitter\.com\/SteveBannonFcts/i)){
    walk(document.body);

    new MutationObserver(function() {
      walk(document.body);
    }).observe(document.body, {
      childList: true
    });
  }
});
