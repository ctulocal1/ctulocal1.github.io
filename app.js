// Set up keywords search then init-keywd()
// Create object for keywords
// Keyword suggestions in search box
// If keyword selected, return pre-set results

// Display results

// function init-keywd() sets searchbox for keywd only

//   If there is no internal heading
//     extract id, artNum, artTxt and content to object
//     set scrollToID value to null(?)
//     push object to array of articles
//   Else (if there *are* sub-articles in body)
//     extract parent article artNum, artTxt, content
//     push parent to array of articles
//     set current id as link
//     select and loop through sections class=level5/6
//       set scrollToID value to id of sub-section
//       set artNum, artTxt and content as per normal
//       push each child to array of articles

$('#searchButton').click(function (event) {clickSearch(event)});
$('#searchBox').removeAttr( "disabled" );
$('#searchBox').keyup(function(event) {
  searchKeys(event);
});
var articles=articles();
window.addEventListener("hashchange", pageChange, false);
window.onload=pageChange;

function pageChange () {
  let pageHash='';
  pageHash=window.location.hash;
  let pageParams='';
  pageParams=window.location.search;
  console.log('pageChange: ' + pageHash + ' ' + pageParams);
  // determine if hashtag is extra deep
  // if so, change location.search to full article and hash to shorter
  // if not and pageParams!='' then scroll to parameter target
  if (pageParams!='') {
    pageParams=pageParams.split('?')[1];
    console.log(pageParams);
    let targetID='#' + pageParams;
    console.log(targetID);
    let target=$(targetID);
    console.log( target.attr(class) );
    let pos = target.offset();
      console.log (pos);
    let top=pos.top;
    $('body, html').animate({scrollTop: pos});
  }
  if (window.location.search!='') { window.location.search='' }
}

function extract (section) {
	let article={};
	article.id=section.id;
	article.num=$(section).find(".artNum").first().text().trim();
	article.title=$(section).find(".artTitle").first().text().trim();
	article.content=$(section).find(".content").first().text().trim();
	return (article);
}

function articles () {
	let articles=[];
	$('article').each (function() {
		let article=extract(this);
		articles.push(article);
		$(this).children('.level5').each (function() {
			let subheading=extract(this);
			articles.push(subheading);
			$(this).children('.level6').each (function() {
				let subparagraph=extract(this);
				articles.push(subparagraph);
			});
		});
	})
	return articles;
}

function itemHTML (itemObject) {
	let resultLink = `
		<h3><a href="#${itemObject.item.id}">${itemObject.item.num} ${itemObject.item.title}</a></h3>
		${itemObject.item.content}
		`;
	return resultLink;
}
	
function display (searchResult) {
	if (searchResult.length == 0) {
		$('#searchResults').text('No result found.')
	} else {
                  $('#searchResults').empty();
		searchResult.forEach ( function (resultObject) {
			let resultHTML=itemHTML(resultObject);
			$('#searchResults').append(resultHTML);
		} );
	}
}

function searchKeys(e){
	let query=$('#searchBox').val();
	if(e.keyCode === 13){
		e.preventDefault(); // Ensure it is only this code that runs
		console.log('Pressed enter');
		let result=search(query);
		display(result);
	} else {
		if (query.length > 1) {
			let result=search (query);
			display(result);
		}
	}
	return false;
}

function clearPreviousResults () {
	$("#searchResults").html('');
}

function clickSearch (e){
	e.preventDefault();
	console.log('clicked');
	clearPreviousResults();
	let result=search( $('#searchBox').val() );
	return result;
}

function keywordSearch (query) {
//	let result=search($('#searchBox').val());
	return false;
}

function search(query) {
	var options = {
		shouldSort: true,
		tokenize: true,
		includeScore: true,
		threshold: 0.2,
		location: 0,
		distance: 100,
		maxPatternLength: 32,
		minMatchCharLength: 2,
		keys: [
			"title"
		]
	};
	var fuse = new Fuse(articles, options); // "list" is the item array
	var result = fuse.search(query);
	return result;
}


// Load Fuse.js return success and callback initiate()
// If not keyword, use fuse.js to search article data
// Initiate fuse-searchbox

// Initiate Service Worker
