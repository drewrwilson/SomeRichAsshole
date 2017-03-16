$(document).ready(function() {
  var configValues = {
    "trumpmode":"subname",
    "skipbannon":false,
    "skipwives":false,
    "skipkids":false
  };
  var configLoaded = false;
  var createdPhrases = []

  $("#actionstations-options-page input.skipbannon, #actionstations-options-page input.skipwives, #actionstations-options-page input.skipkids").change(function(){
    var toSave = {};
    toSave[$(this).attr("name")] = $(this).prop("checked");
    chrome.storage.local.set(toSave, function() {});
  });

  $("#actionstations-options-page input.trumpmode").change(function(){
    var toSave = {};
    toSave[$(this).attr("name")] = $(this).val();
    chrome.storage.local.set(toSave, function() {});
  });

  chrome.storage.local.get(["trumpmode","skipbannon", "skipwives", "skipkids"], function(items) {
    for (key in configValues) {
      if(items[key]){
        configValues[key] = items[key];
        console.log(key+" set to "+items[key]); 
      } {
        console.log("No value set for "+key+", using default "+configValues[key]); 
      }
      if(key == "trumpmode"){
        $("#actionstations-options-page input."+key).each(function(){
          if($(this).val() == configValues[key]){
            $(this).prop("checked", true);
          } else {
            $(this).prop("checked", false);
          }
        });
      } else {
        $("#actionstations-options-page input."+key).prop("checked", configValues[key]);
      }
    }
    configLoaded = true;
  });

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function walk(node)
  {
    var child, next;
    
    switch ( node.nodeType )
    {
      case 1:  // Element
      case 9:  // Document
      case 11: // Document fragment
        child = node.firstChild;
        while ( child )
        {
          next = child.nextSibling;
          walk(child);
          child = next;
        }
        break;
      
      case 3: // Text node
          handleText(node);
        break;
    }
  }

  foundtrumps = 0;
  // you aspire to my level/ you aspire to malevolence
  var prefix_phrases = ["Rich Asshole", "Weapons-Grade Plum", "Witless Fucking Cocksplat", "Mangled Apricot Hellbeast", "Clueless Numpty", "Bloviating Fleshbag", "Tiny-Fingered, Cheeto-Faced, Ferret-Wearing Shitgibbon", "Cockwomble", "Ludicrous Tangerine Ballbag", "Toupeed Fucktrumpet", "Weaselheaded Fucknugget", "Short-Fingered Vulgarian", "Free-Floating Misogynist", "Thin-Skinned Tyrant", "Disgraced Racist", "Talking Combover", "Cheeto-Dusted Bloviator", "Bag of Toxic Sludge", "Man-Sized Sebaceous Cyst", "Hairpiece Come to Life", "Cartoon Plutocrat", "Cable News Fever Dream", "Living YouTube Comment Thread", "Monument to Hubris", "Tantrum Pumpkin", "Marmalade Manchild", "Incoherent Creamsicle", "Mendacious Mango", "Ape in a Suit", "Stale Dorito", "Notorious B.I.G.ot", "Steaming Orange Turd in the International Punch Bowl", "Nacho Cheese Golem", "Moldy Pumpkin Spice Latte", "Brightly Burning Trash Fire", "Sentient Hate-Balloon", "Lead Paint Addict", "Canteloupe Catastrophe", "Corned-Beef Dirigible", "Spray-Tanned Fart Balloon", "Jack 'o Lantern Cum Blimp", "Bawbag", "Authoritarian Orangutan"];
  // some sobriquets do not need a "the" or other title to make sense
  var noprefix_phrases = ["Il Douche", "Lord Dampnut", "Our National Nightmare", "Cheez-It Ceaușescu", "Lumpy Joffrey Baratheon", "Tropicana Jong-il", "Easy D", "Agent Orange", "SCROTUS"];
  // Let's do Bannon too. Fuck that guy.
  var bannon_phrases = ["a self-serious, pseudo-intellectual oil spill", "a hate-filled turnip", "potato blight with a mouth", "sort of a Svengali figure, but just a racist instead of racist caricature", "a malevolent golem made from the flesh of incompetent middle school history teachers", "more or less the actual President, which should terrify you", "a vile man who deserves no platform larger than a street corner", "the reincarnation of Joseph Goebbels", "a literal monster", "an inflamed liver with legs and bad ideas", "the guy who called journalism the 'opposition party'", "who does not belong on the National Security Council", "a douchey 19 year-old college libertarian who got smallpox, lapsed into a 30 year coma, and just woke up with some ideas about government", "a guy who wrote a bad fanfic of Titus Andronicus set in space", "definitely not a lizard in an ill-fitting meat-suit", "not a good person", "a lesser demon inhabiting the bloated corpse of Rasputin", "whose policy experience comes from having played the body of a homeless man on The West Wing", "progenitor of House Harkonnen", "a dumpster fire in the bin behind Dr. Mengele's lab", "a tupperware container of greasy hair preserved from the J-trap under a prison shower", "the wrinkled anus of a paranoid schizophrenic naked mole rat", "an evolutionary cul-de-sac, emphasis on the sac", "who was conceived in a drunken tryst between an ogre and a plate of pork dumplings in the back seat of a Ford Pinto",  "Nosferatu's least competent spawn", "a malignant anal polyp", "a mouth-breathing mound of stomach grease and asbestos", "a maggoty sausage wrapped in the flag and carrying a cross", "a half-bright theocrat who fell out of the ugly tree", "a throbbing rectal tumor", "who was cloned from the ball sweat of Francisco Franco and grown in an avocado patch", "whose moral compass was manufactured by a particularly psychotic gremlin", "a toad riddled with skin tumors", "the poster child for hyper-paranoid manatees with chronic gout", "the fifth horseman of the apocalypse: Pestilence, Famine, Death, War, and Stupid", "a smog monster stuffed into a wet burlap sack with rosacea", "the sulfurous reek of human moral failure made flesh", "who wasn't so very different from a hobbit once, before the One Ring drove him to madness", "the scrapings of a salad bar sneeze guard brought to life by a mail-order necromancer", "an ungently used urinal cake", "an underwear-ruining fart that someone shouldn't have trusted", "a dumpster fire in the bin behind Dr. Mengele's lab", "the skin of a hundred wannabe fascists stitched together and draped over Satan's hat rack", "who is what happens when you binge an entire box of chewable Ex-Lax", "a pair of sweaty Crocs stamping on a human face - forever", "a white hood with a brown skid mark and a bad case of acne", "a flesh golem that couldn't hack it as a screenwriter", "a cloud of mustard gas living in a worm-eaten baseball glove", "a semi-sentient acid slug from the fifth dimension", "the toxoplasmosis in a cat shit smoothie", "the mold at the bottom of your coffee mug at the job you hate", "a filthy pair of men's briefs stolen from Hell's lost & found", "one of those ass zits that make it hurt to sit down", "a grotesquely enlarged goiter determined to be on the wrong side of history", "a garbage truck filled with rancid milk and driven by the Hitler Youth"];
  var phrase = "";

  function newText(tag, text, style) {
    var element = document.createElement(tag);
    element.appendChild(document.createTextNode(text));
    element.setAttribute('class', "some-rich-asshole-enhanced-add");
    if (style) element.setAttribute('style', style);
    return element;
  }

  var mode = "";

  var insertCalls = 0;
  function replacer(match, p1, offset, string)
  {
    realprefix = "";
    realname = "";
    casedphrase = phrase;
    if(mode == "theDevilHimself"){
      if(match == "trump"){
        return("trump");
      }
      if(p1 && p1.length > 0){
        realprefix = p1;
      } else if(prefix_phrases.includes(phrase)){
        realprefix = "The";
      }
      realprefix = realprefix + " ";
    } else if(mode == "theDevilHimselfTitle"){
      realprefix = casedphrase
      if(prefix_phrases.includes(phrase)){
        casedphrase = p1
      } else {
        casedphrase = "";
      }
//alert(realprefix + "'"+casedphrase+"'");
    } else {
      string = offset;
      offset = p1;
    }

    if(match.match(/[A-Z]/) && !match.match(/[a-z]/)){
      casedphrase = phrase.toUpperCase();
      realprefix = realprefix.toUpperCase();
    } else if(match.match(/[a-z]/) && !match.match(/[A-Z]/)){
      casedphrase = phrase.toLowerCase();
      realprefix = realprefix.toLowerCase();
    }

    return(realprefix + casedphrase);
  }

  function trumpCrotchDumplings(textNode)
  {
    var v = textNode.nodeValue;
    mode = "trumpCrotchDumplings";

    var allphrases = prefix_phrases.concat(noprefix_phrases);
    trumpphrase = allphrases[Math.floor(Math.random()*allphrases.length)];
    if(prefix_phrases.includes(trumpphrase)){
      trumpphrase = "The "+trumpphrase;
    }

    // The family get simpler patterns
    if(!configValues || !configValues["skipkids"]){
      phrase = "Eric (the Beavis-y one), Son of "+trumpphrase;
      v = v.replace(/(?:Eric )(?:(?:Frederick|F|F\.) )?Trump/i, replacer);
      phrase = "Donald Jr (the Butthead-y one), Son of "+trumpphrase;
      v = v.replace(/(?:(?:Donald|Don) )(?:(?:John|J|J\.) )?Trump,? Jr\.?/i, replacer);
      phrase = "Ivanka, Complicit with "+trumpphrase;
      v = v.replace(/Ivanka Trump/i, replacer);
      phrase = "Tiffany, Daughter of "+trumpphrase;
      v = v.replace(/Tiffany Trump/i, replacer);
    }
    if(!configValues || !configValues["skipwives"]){
      phrase = "First Trophy Wife of "+trumpphrase;
      v = v.replace(/Ivana Trump/i, replacer);
      phrase = "Second Trophy Wife of "+trumpphrase;
      v = v.replace(/Marla Maples/i, replacer);
      phrase = "Third Trophy Wife of "+trumpphrase;
      v = v.replace(/Melania Trump/i, replacer);
    }


    if(textNode.nodeValue != v){
      foundtrumps++;
      textNode.nodeValue = v;
    }

  }

  function theDevilHimself(textNode)
  {
    var v = textNode.nodeValue;
  //  var prefixes = ["some", "a", "the"];

    var allphrases = prefix_phrases.concat(noprefix_phrases);
    phrase = allphrases[Math.floor(Math.random()*allphrases.length)];
    if(v.match(/trump/i)){
      // sub his title if it's there
      mode = "theDevilHimselfTitle";
//      v = v.replace(/\b(?:mr\.|the|a|some|president|presidential candidate|candidate|president-elect\s*)\b((?:donald\s*)?(?:(?:john|j|j\.)\s*)?\btrump)\b/gi, replacer);
      v = v.replace(/\b(?:mr\.|the|a|some|president|presidential candidate|candidate|president-elect\s*)(\s*(?:donald\s*)?(?:(?:john|j|j\.)\s*)?\btrump)\b/gi, replacer);
      if(textNode.nodeValue == v && createdPhrases.indexOf(v) < 0){
        mode = "theDevilHimself";
        // if it's just the name, swap that
        v = v.replace(/\b(?:donald\s*)?(?:(?:john|j|j\.)\s*)?\btrump\b/gi, replacer);
      } else {
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

    if(bannon_phrases.length > 0){
      var bannonphrase = bannon_phrases[Math.floor(Math.random()*bannon_phrases.length)];
      var prebannon = v;
      if(createdPhrases.indexOf(prebannon) < 0){
        v = v.replace(/\b(?:(steve|steven|stephen)\s*)\s*(bannon)\b/i, "$1 \""+bannonphrase+"\" $2");
        if(v == prebannon){
          if(foundtrumps > 0){
            v = v.replace(/\b((?:(?:steve|steven|stephen)\s*)?(?:(?:k\.)\s*)?\bbannon)\b(?!\s\()/i, "$1 ("+bannonphrase+")");
          } else {
            // his surname is relatively common, don't bank on it being right without the Steve if a Trump hasn't been mentioned
            v = v.replace(/\b((?:(?:steve|steven|stephen)\s*)(?:(?:k\.)\s*)?\bbannon)\b(?!\s\(')/i, "$1 ("+bannonphrase+")");
          }
        }
        if(v != prebannon){
          bannon_phrases.splice(bannon_phrases.indexOf(bannonphrase), 1);
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
    if(!configValues || !configValues["skipbannon"]){
      svengali(textNode);
    }
  }

  chrome.storage.local.get(["trumpmode","skipbannon", "skipwives", "skipkids"], function(items) {
    walk(document.body);
  });

  new MutationObserver(function() {
    walk(document.body);
  }).observe(document.body, {
    childList: true
  });


});
