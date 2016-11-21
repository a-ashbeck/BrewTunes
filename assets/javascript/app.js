// Initialize Firebase
var config = {
    apiKey: "AIzaSyCtdaFgW6hk1SB-pasoWL19J8HuzeSZSo0",
    authDomain: "beertunes-36bca.firebaseapp.com",
    databaseURL: "https://beertunes-36bca.firebaseio.com",
    storageBucket: "beertunes-36bca.appspot.com",
    messagingSenderId: "144484245094"
};
firebase.initializeApp(config);
// reference firebase database
var database = firebase.database();
// some global variables
var input = '';
var beerID = '';
var beerName = '';
var ratingCount = '';
var ratingScore = '';
var genre = '';
var playlistURL = '';
var playlistName = '';
var searches = {};

function hidePlaylist() {
    $('#playlist').hide();
    playlistURL = '';
}

function hideLoad() {
    $('#load').hide();
}

function hideNoBeerFoundError() {
    $('#no-beer-error').hide();
}

function hideInvalidCharacterError() {
    $('#invalid-character-error').hide();
}

function showPlaylist() {
    $('#playlist').show();
}

function showLoad() {
    $('#load').show();
}

function showNoBeerFoundError() {
    $('#no-beer-error').show();
}

function showInvalidCharacterError() {
    $('#invalid-character-error').show();
}

function resetFormField() {
    $('#input-beer').val('');
}

function setPlaylistURL() {
    $('iframe').attr('src', playlistURL);
}

function displayInputBeer() {
    $('#entered-beer').html(input);
}
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
    return 'https://api.untappd.com/v4/' + queryString + 'client_id=' + CLIENTID + '&client_secret=' + CLIENTSECRET;
}

function load() {
    $('#liquid').animate({
        height: '190px'
    }, 2500);
    $('.beer-foam').hide().delay(2100).animate({
        bottom: '200px'
    }, 0).fadeIn(1000).show(0);
    return false;
}

$(document).on('ready', function() {
    hidePlaylist();
    hideLoad();
    hideNoBeerFoundError();
    hideInvalidCharacterError();
    $('.beer-foam').hide();
    $(document).on('click', '#submit', function() {
        hideNoBeerFoundError(); // in case there was an error on a previous submission
        hideInvalidCharacterError(); // in case there was an error on a previous submission
        showLoad();
        load();
        input = $('#input-beer').val().trim();

        if (input.match(/[\w\- ]/)) {
        	displayInputBeer();
	        setTimeout(function() {
	            fetchBeers();
	        }, 5000);
        } else {
        	showInvalidCharacterError();
				}
	      
	      return false;
    });
});

function fetchBeers() {
    $.ajax({
        type: 'GET',
        url: queryURL(initialQueryString(input.replace(' ', '+'))),
        dataType: 'json'
    }).done(function(response) {
        if (response.response.beers.count === 0) {
            showNoBeerFoundError();
            resetFormField();
            hidePlaylist();
        } else {
            var beer = response.response.beers.items[0];
            beerID = beer.beer.bid;
            beerName = beer.beer.beer_name;
            fetchSpecificBeer();
        }
    });
}

function fetchSpecificBeer() {
    $.ajax({
        type: 'GET',
        url: queryURL(specificQueryString(beerID)),
        dataType: 'json'
    }).done(function(response) {
        ratingCount = response.response.beer.rating_count;
        ratingScore = response.response.beer.rating_score;
        if (ratingCount && ratingScore) {
            genres = ['indie', 'rock', 'country', 'metal'];
            genre = genres[Math.floor(Math.random() * 4)];
        }
        fetchPlaylist();
    });
}

function fetchPlaylist() {
    $.ajax({
        type: 'GET',
        url: 'https://rocky-island-57117.herokuapp.com/api/playlists?genre=' + genre,
        dataType: 'json'
    }).done(function(response) {
        playlistName = response.name;
        playlistURL = response.external_urls.spotify.replace('http://open.', 'https://embed.');
        resetFormField();
        setPlaylistURL();
        hideLoad();
        showPlaylist();
        searches = {
            beerInput: input,
            beerReturned: beerName,
            playlist: playlistName,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };

        database.ref().push(searches);
    });
}
