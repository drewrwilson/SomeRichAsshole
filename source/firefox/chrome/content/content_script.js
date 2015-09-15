(function() {

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

        v = v.replace(/\bDonald John Trump\b/g, "Some Rich Asshole");
        v = v.replace(/\bThe Donald\b/g, "The rich asshole");
      	v = v.replace(/\bMr. Trump\b/g, "rich asshole");
      	v = v.replace(/\bDonald J. Trump\b/g, "this rich asshole");
      	v = v.replace(/\bPresidential Candidate Trump\b/g, "This rich asshole who wants to be president");
      	v = v.replace(/\bpresidential candidate Donald Trump\b/g, "rich asshole");
      	v = v.replace(/\bPresidential candidate Donald Trump\b/g, "Some rich asshole");
      	v = v.replace(/\bDonald Trump\b/g, "Some rich asshole");
      	v = v.replace(/\bDONALD J. TRUMP\b/g, "SOME RICH ASSHOLE");
      	v = v.replace(/\bDONALD J TRUMP\b/g, "SOME RICH ASSHOLE");
      	v = v.replace(/\bDONALD TRUMP\b/g, "SOME RICH ASSHOLE");
      	v = v.replace(/\bTRUMP\b/g, "RICH ASSHOLE");
      	v = v.replace(/\bTrump\b/g, "rich asshole")
      	v = v.replace(/\b#DonaldTrump\b/g, "#SomeRichAsshole")
      	v = v.replace(/\b#donaldtrump\b/g, "#SomeRichAsshole")
      	v = v.replace(/\b#DONALDTRUMP\b/g, "#SomeRichAsshole")
      	v = v.replace(/\b#Trump\b/g, "#SomeRichAsshole")
      	v = v.replace(/\b#trump\b/g, "#SomeRichAsshole")
      	v = v.replace(/\b#TRUMP\b/g, "#SomeRichAsshole")
      	v = v.replace(/\b#Trump2016\b/g, "#SomeRichAsshole")
      	v = v.replace(/\b#TeamTrump\b/g, "#TeamRichAsshole")
      	v = v.replace(/\b#teamtrump\b/g, "#TeamRichAsshole")
      	v = v.replace(/\b#teamTrump\b/g, "#TeamRichAsshole")
      	v = v.replace(/\bTrump2016\b/g, "RichAsshole2016")
      	v = v.replace(/\bdonaldjtrump.com\b/g, "SomeRichAsshole.com")

        textNode.nodeValue = v;
    }

    function windowLoadHandler()
    {
        // Dear Mozilla: I hate you for making me do this.
        window.removeEventListener('load', windowLoadHandler);

        document.getElementById('appcontent').addEventListener('DOMContentLoaded', function(e) {
            walk(e.originalTarget.body);
        });
    }

    window.addEventListener('load', windowLoadHandler);
}());
