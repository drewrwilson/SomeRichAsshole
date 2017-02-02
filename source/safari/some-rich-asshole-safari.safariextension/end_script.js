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

function _getPhrase(caps_mode = null, prefix = false)
{
  var prefixes = ["the", "some"];
  var phrases = ["rich asshole", "weapons-grade plum", "witless fucking cocksplat", "weaselheaded fucknugget", "mangled apricot hellbeast", "clueless numpty", "bloviating fleshbag", "tiny-fingered, cheeto-faced, ferret-wearing shitgibbon", "cockwomble", "ludicrous tangerine ballbag", "toupeed fucktrumpet", "weaselheaded fucknugget", "short-fingered vulgarian", "free-floating misogynist", "thin-skinned tyrant", "disgraced racist", "talking combover", "cheeto-dusted bloviator", "bag of toxic sludge", "man-sized sebaceous cyst", "hairpiece come to life", "cartoon plutocrat", "cable news fever dream", "living youtube comment thread", "monument to hubris", "tantrum pumpkin", "marmalade manchild", "incoherent creamsicle", "mendacious mango", "lord dampnut", "ape in a suit", "stale dorito", "il douche"];
  var phrase = phrases[Math.floor(Math.random()*phrases.length)];
  if(prefix && phrase != "il douche"){
    phrase = prefixes[Math.floor(Math.random()*prefixes.length)]+" "+phrase;
/*    if(phrase.match(/^a [aeiou]/)){
      phrase = phrase.replace(/^a /, "an ");
    }
 */
  }
  if(caps_mode == "allcaps"){
    return phrase.toUpperCase();
  } else if(caps_mode == "firstcaps"){
    return phrase.replace(/(^|\s)[a-z]/g,function(f){return f.toUpperCase();});
  } else {
    return phrase;
  }
}

function handleText(textNode)
{
	var v = textNode.nodeValue;
	
	v = v.replace(/\b(THE|A|SOME)\b\s+\bDONALD JOHN TRUMP\b/g, "$1 "+_getPhrase("allcaps"));
	v = v.replace(/\b([tT]he|[aA]|[sS]ome)\b\s+\bDonald John Trump\b/g, "$1 "+_getPhrase("firstcaps"));
	v = v.replace(/\b([tT]he|[aA]|[sS]ome)\b\s+\bdonald john trump\b/g, "$1 "+_getPhrase("firstcaps"));
	v = v.replace(/\bDONALD JOHN TRUMP\b/g, _getPhrase("allcaps", true));
	v = v.replace(/\bDonald John Trump\b/g, _getPhrase("firstcaps", true));
	v = v.replace(/\bdonald john trump\b/g, _getPhrase(null, true));
	v = v.replace(/^Donald John Trump$/g, _getPhrase("firstcaps", true));
	v = v.replace(/\b(THE|A|SOME)\b\s+\bDONALD J\.? TRUMP\b/g, "$1 "+_getPhrase("allcaps"));
	v = v.replace(/\b([tT]he|[aA]|[sS]ome)\b\s+\bDonald J\.? Trump\b/g, "$1 "+_getPhrase("firstcaps"));
	v = v.replace(/\b([tT]he|[aA]|[sS]ome)\b\s+\bdonald j\.? trump\b/g, "$1 "+_getPhrase("firstcaps"));
	v = v.replace(/\bDONALD J\.? TRUMP\b/g, _getPhrase("allcaps", true));
	v = v.replace(/\bDonald J\.? Trump\b/g, _getPhrase("firstcaps", true));
	v = v.replace(/\bdonald j\.? trump\b/g, _getPhrase(null, true));
	v = v.replace(/([\.!\?][\n\s]*)\bTrump\b/g, "$1"+_getPhrase("firstcaps", true));
	v = v.replace(/\bMR. TRUMP\b/g, "MR. "+_getPhrase("allcaps"));
	v = v.replace(/\bMr. Trump\b/g, "Mr. "+_getPhrase("firstcaps"));
	v = v.replace(/\bmr. trump\b/g, "mr. "+_getPhrase());
	v = v.replace(/\bPRESIDENTIAL CANDIDATE TRUMP\b/g, _getPhrase("allcaps")+" WHO WANTS TO BE PRESIDENT");
	v = v.replace(/\bPresidential Candidate Trump\b/g, _getPhrase()+" who wants to be president");
	v = v.replace(/\bpresidential candidate trump\b/g, _getPhrase()+" who wants to be president");
	v = v.replace(/\bPRESIDENTIAL CANDIDATE DONALD TRUMP\b/g, _getPhrase("allcaps")+" WHO WANTS TO BE PRESIDENT");
	v = v.replace(/\bPresidential candidate Donald Trump\b/g, _getPhrase()+" who wants to be president");
	v = v.replace(/\bpresidential candidate Donald Trump\b/gi, _getPhrase()+" who wants to be president");
	v = v.replace(/\b(THE|A|SOME)\b\s+\bDONALD TRUMP\b/g, "$1 "+_getPhrase("allcaps"));
	v = v.replace(/\b([tT]he|[aA]|[sS]ome)\b\s+\bDonald Trump\b/g, "$1 "+_getPhrase("firstcaps"));
	v = v.replace(/\b([tT]he|[aA]|[sS]ome)\b\s+\bdonald trump\b/g, "$1 "+_getPhrase("firstcaps"));
	v = v.replace(/\bDONALD TRUMP\b/g, _getPhrase("allcaps", true));
	v = v.replace(/\bDonald Trump\b/g, _getPhrase("firstcaps", true));
	v = v.replace(/^Donald Trump\b/g, _getPhrase("firstcaps", true));
	v = v.replace(/\bdonald trump\b/g, _getPhrase(null, true));
	v = v.replace(/\b#DONALDTRUMP\b/g, "#SOMERICHASSHOLE");
	v = v.replace(/\b#DonaldTrump\b/gi, "#SomeRichAsshole");
	v = v.replace(/\b#TRUMP\b/g, "#SOMERICHASSHOLE");
	v = v.replace(/\b#Trump\b/gi, "#SomeRichAsshole");
	v = v.replace(/\b#TRUMP2016\b/g, "#SOMERICHASSHOLE2016");
	v = v.replace(/\b#Trump2016\b/gi, "#SomeRichAsshole2016");
	v = v.replace(/\b#TEAMTRUMP\b/g, "#TEAMRICHASSHOLE");
	v = v.replace(/\b#TeamTrump\b/gi, "#TeamRichAsshole");
	v = v.replace(/\bTRUMP2016\b/g, "RICHASSHOLE2016");
	v = v.replace(/\bTrump2016\b/gi, "RichAsshole2016");
	v = v.replace(/\bdonaldjtrump.com\b/gi, "SomeRichAsshole.com");
	v = v.replace(/\bTHE DONALD\b/g, _getPhrase("allcaps", true));
	v = v.replace(/\bThe Donald\b/g, _getPhrase("firstcaps", true));
	v = v.replace(/\bthe donald\b/g, _getPhrase(null, true));
	v = v.replace(/\b(THE|A|SOME)\b\s+\bTRUMP\b/g, "$1 "+_getPhrase("allcaps"));
	v = v.replace(/\b([tT]he|[aA]|[sS]ome)\b\s+\bTrump\b/g, "$1 "+_getPhrase("firstcaps"));
	v = v.replace(/\bTRUMP\b/g, _getPhrase("allcaps", true));
	v = v.replace(/\bTrump\b/g, _getPhrase("firstcaps", true));
	v = v.replace(/^Trump\b/g, _getPhrase("firstcaps", true));
	v = v.replace(/\.( )*\bTrump\b/g, ". "+_getPhrase("firstcaps", true));
	
	textNode.nodeValue = v;
}

walk(document.body);
