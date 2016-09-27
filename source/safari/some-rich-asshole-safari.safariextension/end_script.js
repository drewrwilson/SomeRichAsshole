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

function _getPhrase(caps_mode = null)
{
  var phrases = ["rich asshole", "weapons-grade plum", "witless fucking cocksplat", "weaselheaded fucknugget", "mangled apricot hellbeast", "clueless numpty", "bloviating fleshbag", "tiny-fingered, cheeto-faced, ferret-wearing shitgibbon", "cockwomble", "ludicrous tangerine ballbag", "toupeed fucktrumpet", "weaselheaded fucknugget", "short-fingered vulgarian", "free-floating misogynist", "thin-skinned tyrant", "disgraced racist", "talking combover", "cheeto-dusted bloviator", "bag of toxic sludge", "man-sized sebaceous cyst", "hairpiece come to life", "cartoon plutocrat", "cable news fever dream", "living youtube comment thread", "monument to hubris", "tantrum pumpkin", "marmalade manchild", "incoherent creamsicle", "il douche", "mendacious mango", "robert mugabe of the hudson", "ape in a suit", "stale dorito"];
  if(caps_mode == "allcaps"){
    return phrases[Math.floor(Math.random()*phrases.length)].toUpperCase();
  } else if(caps_mode == "firstcaps"){
    phrase = phrases[Math.floor(Math.random()*phrases.length)];
    return phrase.replace(/(^|\s)[a-z]/g,function(f){return f.toUpperCase();});
  } else {
    return phrases[Math.floor(Math.random()*phrases.length)];
  }
}

function handleText(textNode)
{
	var v = textNode.nodeValue;

	v = v.replace(/\bDONALD JOHN TRUMP\b/g, "SOME "+_getPhrase("allcaps"));
	v = v.replace(/\bDonald John Trump\b/g, "Some "+_getPhrase("firstcaps"));
	v = v.replace(/^Donald John Trump$/g, "Some "+_getPhrase("firstcaps"));
	v = v.replace(/\bdonald john trump\b/g, "some "+_getPhrase());
	v = v.replace(/\bDONALD J. TRUMP\b/g, "SOME "+_getPhrase("allcaps"));
	v = v.replace(/\bDonald J. Trump\b/g, "Some "+_getPhrase("firstcaps"));
	v = v.replace(/\bdonald j. trump\b/g, "some "+_getPhrase());
	v = v.replace(/\bDONALD J TRUMP\b/g, "SOME "+_getPhrase("allcaps"));
	v = v.replace(/\bDonald J Trump\b/g, "Some "+_getPhrase("firstcaps"));
	v = v.replace(/\bdonald j trump\b/g, "some "+_getPhrase());
	v = v.replace(/\bMR. TRUMP\b/g, "MR. "+_getPhrase("allcaps"));
	v = v.replace(/\bMr. Trump\b/g, "Mr. "+_getPhrase("firstcaps"));
	v = v.replace(/\bmr. trump\b/g, "mr. "+_getPhrase());
	v = v.replace(/\bPRESIDENTIAL CANDIDATE TRUMP\b/g, "SOME "+_getPhrase("allcaps")+" WHO WANTS TO BE PRESIDENT");
	v = v.replace(/\bPresidential Candidate Trump\b/g, "Some "+_getPhrase()+" who wants to be president");
	v = v.replace(/\bpresidential candidate trump\b/g, "some "+_getPhrase()+" who wants to be president");
	v = v.replace(/\bPRESIDENTIAL CANDIDATE DONALD TRUMP\b/g, "SOME "+_getPhrase("allcaps")+" WHO WANTS TO BE PRESIDENT");
	v = v.replace(/\bPresidential candidate Donald Trump\b/g, "Some "+_getPhrase()+" who wants to be president");
	v = v.replace(/\bpresidential candidate Donald Trump\b/gi, "some "+_getPhrase()+" who wants to be president");
	v = v.replace(/\bDONALD TRUMP\b/g, "SOME "+_getPhrase("allcaps"));
	v = v.replace(/\bDonald Trump\b/g, "Some "+_getPhrase("firstcaps"));
	v = v.replace(/^Donald Trump\b/g, "Some "+_getPhrase("firstcaps"));
	v = v.replace(/\.( )*\bDonald Trump\b/g, ". Some "+_getPhrase("firstcaps"));
	v = v.replace(/\bdonald trump\b/g, "some "+_getPhrase());
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
	v = v.replace(/\bTHE DONALD\b/g, "THE "+_getPhrase("allcaps"));
	v = v.replace(/\bThe Donald\b/g, "The "+_getPhrase("firstcaps"));
	v = v.replace(/\bthe donald\b/g, "the "+_getPhrase());
	v = v.replace(/\bTRUMP\b/g, ""+_getPhrase("allcaps"));
	v = v.replace(/\bTrump\b/g, "The "+_getPhrase("firstcaps"));
	v = v.replace(/^Trump\b/g, "The "+_getPhrase("firstcaps"));
	v = v.replace(/\.( )*\bTrump\b/g, ". The "+_getPhrase("firstcaps"));
	
	textNode.nodeValue = v;
}

walk(document.body);
