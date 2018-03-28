//init sequence
var articles=articles();
$('#searchButton').click(function (event) {clickSearch(event)});
$('#searchBox').removeAttr( "disabled" );
$('#searchBox').keyup(function(event) {
  searchKeys(event);
});
window.addEventListener("hashchange", pageChange, false);
window.onload=pageChange;

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

function extract (section) {
  let article={};
  article.id=section.id;
  article.num=$(section).find(".artNum").first().text().trim();
  article.title=$(section).find(".artTitle").first().text().trim();
  article.content=$(section).find(".content").first().text().trim();
  return (article);
}

function pageChange () {
  let pageHash=window.location.hash;
  let pageParams=window.location.search;
  let url=new URL(window.location.href);
  // determine if hashtag is extra deep 
  // and, if so, reconstruct to make deep hash into query and shorten hash
  if ( pageHash.indexOf('.') != -1 ) {
    url=reHash(url);
    window.location=url.href; // re-loads page with new query/hash
    // on reload, this block will be skipped and go straight to next
  }
  // if there’s a query string then use it as a target to scroll down
  if (pageParams!='') {
    pageParams=pageParams.split('?')[1];
    let targetID='#' + pageParams;
    // use getElem because the . in the id attribute confuses jQuery
    let target=document.getElementById( pageParams ); 
    let pos = $(target).offset();
    let top=pos.top - 130; // the -130 accounts for nav bar height
    $('body, html').animate({scrollTop: top});
    url.search='';
    history.replaceState({ 'sec': pageParams }, '', url.href);
  }
}

function reHash (url) {
  let pageHash=url.hash;
  pageHash=pageHash.split('#')[1];
  url.search=pageHash;
  let newHash=pageHash.split('.')[0];
  url.hash=newHash;
  return url;
}

function itemHTML (itemObject) {
  let url=new URL(window.location.href);
  url.hash=itemObject.item.id;
  let linkHREF=reHash(url);
  let resultLink = `
    <blockquote style="font-size:var(--text-size-0); line-height:var(--text-size-1)">
      <h3 style="font-size:var(--text-size-1)"><a href="${linkHREF}">${itemObject.item.num} ${itemObject.item.title}</a></h3>
      ${itemObject.item.content}
    </blockquote>
  `;
  return resultLink;
}

function display (searchResults) {
  if (searchResults.length == 0) {
    $('#searchResults').text('No result found.')
  } else {
    $('#searchResults').empty();
    searchResults.forEach ( function (resultObject) {
      let resultHTML=itemHTML(resultObject);
      $('#searchResults').append(resultHTML);
    } );
  }
}

function searchKeys(e){
  let query=$('#searchBox').val();
  if(e.keyCode === 13){
    e.preventDefault(); // Ensure it is only this code that runs
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

function clickSearch (e){
  e.preventDefault();
  let result=search( $('#searchBox').val() );
  display(result);
}

/* keywordSearch is for later
function keywordSearch (query) {
  //	let result=search($('#searchBox').val());
  return false;
}
*/

function search(query) {
  var options = {
    shouldSort: true,
    tokenize: true,
    includeScore: true,
    threshold: 0.2,
    findAllMatches: true,
    includeMatches: true,
    maxPatternLength: 32,
    minMatchCharLength: 2,
    keys: [
      {name:'num',weight:0.45},
      {name:'title',weight:0.35},
      {name:'contents',weight:0.2}
    ]
  };
  var fuse = new Fuse(articles, options); // "list" is the item array
  var result = fuse.search(query);
  return result;
}
