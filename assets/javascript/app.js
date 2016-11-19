// The business

// Initialize Firebase
var config = {
  apiKey: "AIzaSyCtdaFgW6hk1SB-pasoWL19J8HuzeSZSo0",
  authDomain: "beertunes-36bca.firebaseapp.com",
  databaseURL: "https://beertunes-36bca.firebaseio.com",
  storageBucket: "beertunes-36bca.appspot.com",
  messagingSenderId: "144484245094"
};
firebase.initializeApp(config);

var database = firebase.database();

// some global variables
var input = 'bud'; //$('#inputBeer').val().trim();
var beerID = '';
var beerName = '';
var ratingCount = '';
var ratingScore = '';
var genre = '';

// Untappd API
var CLIENTID = 'A9F55BC3824C82CA5DC0FBC018240C4E61ED09A1';
var CLIENTSECRET = '4C79983D9CBA23DE70A551F209EBAE2512A0BE8C';
function initialQueryString(beerInput) {
  return 'search/beer?q=' + beerInput + '&';
}
function specificQueryString(beerID) {
  return 'beer/info/' + beerID + '?';
}
function queryURL(queryString) {
  return 'https://api.untappd.com/v4/' + queryString + 'client_id=' + CLIENTID +
         '&client_secret=' + CLIENTSECRET;
}


$(document).on('ready', function() {
  // $(document).on('click', '#submit', function() {
    fetchBeers(input);


    return false;
  // });
});

function fetchBeers(input) {
  $.ajax({
    type: 'GET',
    url: queryURL(initialQueryString(input.replace(' ', '+'))),
    dataType: 'json'
  }).done(function(response) {
    var beer = response.response.beers.items[0];
    beerID = beer.beer.bid;
    beerName = beer.beer.beer_name;
    console.log(beerID);
    console.log(beerName);

    fetchSpecificBeer(beerID);
  });
}

function fetchSpecificBeer(beerID){
  $.ajax({
    type: 'GET',
    url: queryURL(specificQueryString(beerID)),
    dataType: 'json'
  }).done(function(response) {
    ratingCount = response.response.beer.rating_count;
    ratingScore = response.response.beer.rating_score;
    console.log(ratingCount);
    console.log(ratingScore);

    if (ratingCount && ratingScore) {
      genres = ['indie', 'rock', 'country', 'metal'];
      genre = genres[Math.floor(Math.random() * 4)];
    }

    fetchPlaylist(genre);
  });
}

function fetchPlaylist(genre) {
  $.ajax({
    type: 'GET',
    url: 'https://rocky-island-57117.herokuapp.com/api/playlists?genre=' + genre,
    dataType: 'json'
  }).done(function(response) {
    playlistURL = response.external_urls.spotify;
    console.log(playlistURL);
  });
}
