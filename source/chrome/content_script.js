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

function handleText(textNode)
{
	var v = textNode.nodeValue;
	
	v = v.replace(/\bDONALD JOHN TRUMP\b/g, "SOME RICH ASSHOLE");
	v = v.replace(/\bDonald John Trump\b/g, "Some Rich Asshole");
	v = v.replace(/^Donald John Trump$/g, "Some Rich Asshole");
	v = v.replace(/\bdonald john trump\b/g, "some rich asshole");
	v = v.replace(/\bDONALD J. TRUMP\b/g, "SOME RICH ASSHOLE");
	v = v.replace(/\bDonald J. Trump\b/g, "Some Rich Asshole");
	v = v.replace(/\bdonald j. trump\b/g, "some rich asshole");
	v = v.replace(/\bDONALD J TRUMP\b/g, "SOME RICH ASSHOLE");
	v = v.replace(/\bDonald J Trump\b/g, "Some Rich Asshole");
	v = v.replace(/\bdonald j trump\b/g, "some rich asshole");
	v = v.replace(/\bMR. TRUMP\b/g, "MR. RICH ASSHOLE");
	v = v.replace(/\bMr. Trump\b/g, "Mr. Rich Asshole");
	v = v.replace(/\bmr. trump\b/g, "mr. rich asshole");
	v = v.replace(/\bPRESIDENTIAL CANDIDATE TRUMP\b/g, "SOME RICH ASSHOLE WHO WANTS TO BE PRESIDENT");
	v = v.replace(/\bPresidential Candidate Trump\b/g, "Some rich asshole who wants to be president");
	v = v.replace(/\bpresidential candidate trump\b/g, "some rich asshole who wants to be president");
	v = v.replace(/\bPRESIDENTIAL CANDIDATE DONALD TRUMP\b/g, "SOME RICH ASSHOLE WHO WANTS TO BE PRESIDENT");
	v = v.replace(/\bPresidential candidate Donald Trump\b/g, "Some rich asshole who wants to be president");
	v = v.replace(/\bpresidential candidate Donald Trump\b/gi, "some rich asshole who wants to be president");
	v = v.replace(/\bDONALD TRUMP\b/g, "SOME RICH ASSHOLE");
	v = v.replace(/\bDonald Trump\b/g, "Some Rich Asshole");
	v = v.replace(/^Donald Trump\b/g, "Some Rich Asshole");
	v = v.replace(/\.( )*\bDonald Trump\b/g, ". Some Rich Asshole");
	v = v.replace(/\bdonald trump\b/g, "some rich asshole");
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
	v = v.replace(/\bTHE DONALD\b/g, "THE RICH ASSHOLE");
	v = v.replace(/\bThe Donald\b/g, "The Rich Asshole");
	v = v.replace(/\bthe donald\b/g, "the rich asshole");
	v = v.replace(/\bTRUMP\b/g, "RICH ASSHOLE");
	v = v.replace(/\bTrump\b/g, "The Rich Asshole");
	v = v.replace(/^Trump\b/g, "The Rich Asshole");
	v = v.replace(/\.( )*\bTrump\b/g, ". The Rich Asshole");
	
	textNode.nodeValue = v;
}

walk(document.body);

new MutationObserver(function() {
	walk(document.body);
}).observe(document.body, {
	childList: true
});