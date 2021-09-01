//init sequence
var articles=articles();
console.log(articles);
$('#searchButton').click(function (event) {clickSearch(event)});
$('#searchButton').hide();
$('#searchBox').removeAttr( "disabled" );
$('#searchBox').keyup(function(event) {
    searchKeys(event);
});
window.addEventListener("hashchange", pageChange, false);
window.onload=pageChange;
initSW();

function initSW () { console.log ('initSW called');
  if ('serviceWorker' in navigator) {
    console.log('Service Worker is supported');

    navigator.serviceWorker.register('sw.js')
    .then(function(swReg) {
      console.log('Service Worker is registered', swReg);

      swRegistration = swReg;
    })
    .catch(function(error) {
      console.error('Service Worker Error', error);
    });
  } else {
    console.warn('Service worker is not supported');
  }
}
// 
// Functions related to navigation
//
function pageChange () {
    let pageHash=window.location.hash;
    let pageParams=window.location.search;
    let url=new URL(window.location.href);
    // determine if hashtag is extra deep 
    // and, if so, reconstruct to make deep hash into query and shorten hash
    if ( pageHash == '#search') {
        $("#searchBox").focus();
    }
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

//
// Functions to create data image of the HTML for search
//
function articles () {
  let articles={level1:[],level2:[],level3:[],level4:[],level5:[]};
  $('article').each (function() {
    let article=extract(this);
    if ( article.num.indexOf('sec') != -1) {
        articles.level1.push(article); }
    else if ( article.num.indexOf('-') == -1) {
        articles.level2.push(article); }
    else articles.level3.push(article);
    $(this).children('.level5').each (function() {
      let subheading=extract(this);
      subheading.parents=article.parents+' » '+article.num+' '+article.title.toUpperCase();
      articles.level4.push(subheading);
      $(this).children('.level6').each (function() {
        let subparagraph=extract(this);
        subparagraph.parents=subheading.parents+' » '+subheading.num+' '+subheading.title.toUpperCase();
        articles.level5.push(subparagraph);
      });
    });
  })
  return articles;
}

function extract (section) {
  let article={};
  article.id=section.id;
  article.parents=$(section).find(".breadcrumb").first().text().trim().toUpperCase();
  article.num=$(section).find(".artNum").first().text().trim();
  article.title=$(section).find(".artTitle").first().text().trim();
  article.content=$(section).find(".content").first().text().trim();
  return (article);
}

// 
// Search-oriented functions
//
function snippet (itemContent) {
    itemContent=itemContent.slice(0,230);
    return  itemContent;
}

function itemHTML (itemObject) {
    let url=new URL(window.location.href);
    url.hash=itemObject.item.id;
    let linkHREF=reHash(url);
    let resultLink = `
        <li>
        <div>${itemObject.item.parents}</div>
        <h4><a href="${linkHREF}">${itemObject.item.num} ${itemObject.item.title}</a></h4>
        ${itemObject.item.content}
    </li>
        `;
    return resultLink;
}

function display (searchResults) {
    if (searchResults.length == 0) {
        $('#searchResults').text('No result found.')
    } else {
        $('#searchResults').empty();
        searchResults.forEach ( function (resultObject) {
            resultObject.item.content=snippet(resultObject.item.content);
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
        threshold: 0.1,
        findAllMatches: true,
        includeMatches: true,
        maxPatternLength: 32,
        minMatchCharLength: 2,
        keys: [
        {name:'num',weight:0.45},
        {name:'title',weight:0.35},
        {name:'contents',weight:0.42}
        ]
    };
    var fuse1 = new Fuse(articles.level1, options);
    var result1 = fuse1.search(query);
    var fuse2 = new Fuse(articles.level2, options);
    var result2 = fuse2.search(query);
    var fuse3 = new Fuse(articles.level3, options);
    var result3 = fuse3.search(query);
    var fuse4 = new Fuse(articles.level4, options);
    var result4 = fuse4.search(query);
    var fuse5 = new Fuse(articles.level5, options);
    var result5 = fuse5.search(query);
    var result=[];
    result=result.concat(result1,result2,result3,result4,result5);
    return result;
}
