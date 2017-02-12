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
var prefix_phrases = ["Rich Asshole", "Weapons-Grade Plum", "Witless Fucking Cocksplat", "Mangled Apricot Hellbeast", "Clueless Numpty", "Bloviating Fleshbag", "Tiny-Fingered, Cheeto-Faced, Ferret-Wearing Shitgibbon", "Cockwomble", "Ludicrous Tangerine Ballbag", "Toupeed Fucktrumpet", "Weaselheaded Fucknugget", "Short-Fingered Vulgarian", "Free-Floating Misogynist", "Thin-Skinned Tyrant", "Disgraced Racist", "Talking Combover", "Cheeto-Dusted Bloviator", "Bag of Toxic Sludge", "Man-Sized Sebaceous Cyst", "Hairpiece Come to Life", "Cartoon Plutocrat", "Cable News Fever Dream", "Living YouTube Comment Thread", "Monument to Hubris", "Tantrum Pumpkin", "Marmalade Manchild", "Incoherent Creamsicle", "Mendacious Mango", "Ape in a Suit", "Stale Dorito", "Notorious B.I.G.ot", "Steaming Orange Turd in the International Punch Bowl", "Nacho Cheese Golem", "Moldy Pumpkin Spice Latte", "Brightly Burning Trash Fire", "Sentient Hate-Balloon", "Lead Paint Addict", "Canteloupe Catastrophe", "Corned-Beef Dirigible", "Spray-Tanned Fart Balloon"];
// some sobriquets do not need a "the" or other title to make sense
var noprefix_phrases = ["Il Douche", "Lord Dampnut", "Our National Nightmare", "Cheez-It Ceaușescu", "Lumpy Joffrey Baratheon", "Tropicana Jong-il", "Easy D"];
// Let's do Bannon too. Fuck that guy.
var bannon_phrases = ["a self-serious pseudo-intellectual oil spill", "a hate-filled turnip", "potato blight with a mouth", "sort of a Svengali figure but just a racist instead of racist caricature", "a malevolent golem made from the flesh of incompetent middle school history teachers", "more or less the actual President, which should terrify you", "a vile man who deserves no platform larger than a street corner", "the reincarnation of Joseph Goebbels", "a literal monster", "an inflamed liver with legs and bad ideas", "a guy who literally called journalism the 'opposition party'", "who does not belong on the National Security Council", "a douchey 19 year-old college libertarian who got the pox, lapsed into a 30 year coma, and just woke up with some ideas about government", "a guy who wrote a bad fanfic of Titus Andronicus set in space", "definitely not a lizard in an ill-fitting meat-suit", "not a good person", "a lesser demon inhabiting the bloated corpse of Rasputin", "whose policy experience comes from having played the body of a homeless man on The West Wing", "the last descendant of House Harkonnen"];
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
  if(mode == "theDevilHimself"){
    if(match == "trump"){
      return("trump");
    }
    if(p1 && p1.length > 0){
      realprefix = p1;
    } else if(prefix_phrases.includes(phrase)){
//      realprefix = prefixes[Math.floor(Math.random()*prefixes.length)]+" "+v;
      realprefix = "The";
    }
    realprefix = realprefix + " ";
  } else {
    string = offset;
    offset = p1;
  }
  casedphrase = phrase;
  if(match.match(/[A-Z]/) && !match.match(/[a-z]/)){
    casedphrase = phrase.toUpperCase();
    realprefix = realprefix.toUpperCase();
  } else if(match.match(/[a-z]/) && !match.match(/[A-Z]/)){
    casedphrase = phrase.toLowerCase();
    realprefix = realprefix.toLowerCase();
  }
  console.log("Inserting "+realprefix + casedphrase+" for '"+match+"'");

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
  phrase = "Eric (the Beavis-y one), Son of "+trumpphrase;
	v = v.replace(/(?:Eric )(?:(?:Frederick|F|F\.) )?Trump/i, replacer);
  phrase = "Donald Jr (the Butthead-y one), Son of "+trumpphrase;
	v = v.replace(/(?:(?:Donald|Don) )(?:(?:John|J|J\.) )?Trump,? Jr\.?/i, replacer);
  phrase = "First Trophy Wife of "+trumpphrase;
	v = v.replace(/Ivana Trump/i, replacer);
  phrase = "Second Trophy Wife of "+trumpphrase;
	v = v.replace(/Marla Maples/i, replacer);
  phrase = "Third Trophy Wife of "+trumpphrase;
	v = v.replace(/Melania Trump/i, replacer);
  phrase = "Ivanka, Daughter of "+trumpphrase;
	v = v.replace(/Ivanka Trump/i, replacer);
  phrase = "Tiffany, Daughter of "+trumpphrase;
	v = v.replace(/Tiffany Trump/i, replacer);


  if(textNode.nodeValue != v){
    foundtrumps++;
    textNode.nodeValue = v;
  }

}

function theDevilHimself(textNode)
{
	var v = textNode.nodeValue;
  mode = "theDevilHimself";
//  var prefixes = ["some", "a", "the"];

  var allphrases = prefix_phrases.concat(noprefix_phrases);
  phrase = allphrases[Math.floor(Math.random()*allphrases.length)];

	v = v.replace(/\b(?:(#|mr\.|the|a|some|president|presidential candidate|candidate|president-elect)\s*)?\b(?:donald\s*)?(?:(?:john|j|j\.)\s*)?\btrump\b/gi, replacer);

  if(textNode.nodeValue != v){
    foundtrumps++;
    textNode.nodeValue = v;
  }
}

function svengali(textNode)
{
	var v = textNode.nodeValue;
  mode = "svengali";

  if(bannon_phrases.length > 0){
    var bannonphrase = bannon_phrases[Math.floor(Math.random()*bannon_phrases.length)];
    var prebannon = v;
    if(foundtrumps > 0){
    	v = v.replace(/\b((?:(?:steve|steven|stephen)\s*)?(?:(?:k\.)\s*)?\bbannon)\b(?!\s\()/i, "$1 ("+bannonphrase+")");
    } else {
      // his surname is relatively common, don't bank on it being right without the Steve if a Trump hasn't been mentioned
    	v = v.replace(/\b((?:(?:steve|steven|stephen)\s*)(?:(?:k\.)\s*)?\bbannon)\b(?!\s\()/i, "$1 ("+bannonphrase+")");
    }
    if(v != prebannon){
      bannon_phrases.splice(bannon_phrases.indexOf(bannonphrase), 1);
      textNode.nodeValue = v;
    }
  }
}

function handleText(textNode)
{
  if ('classList' in textNode && element.classList.contains("some-rich-asshole-enhanced-add")){
    alert("skipping "+textNode.nodeValue);
    return;
  }
  trumpCrotchDumplings(textNode);
  theDevilHimself(textNode);
  svengali(textNode);

//	v = v.replace(/([\.!\?][\n\s]*)\bTrump\b/gi, "$1"+_getPhrase("firstcaps", true));
//	v = v.replace(/\b([tT]he|[aA]|[sS]ome)\b\s+\bdonald trump\b/gi, "$1 "+_getPhrase("firstcaps"));
//	v = v.replace(/\bdonaldjtrump.com\b/gi, "SomeRichAsshole.com");
//	v = v.replace(/\bthe donald\b/gi, _getPhrase(null, true));
//	v = v.replace(/\.( )*\bTrump\b/gi, ". "+_getPhrase("firstcaps", true));
	
}

walk(document.body);

new MutationObserver(function() {
	walk(document.body);
}).observe(document.body, {
	childList: true
});
