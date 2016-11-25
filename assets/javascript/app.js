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
// global variables for the beers and playlists
var input = '';
var beerID = '';
var beerName = '';
var ratingCount = '';
var ratingScore = '';
var genre = '';
var playlistURL = '';
var playlistName = '';
var searches = {};

//hide the playlist
function hidePlaylist() {
    $('#playlist').hide();
    playlistURL = '';
}

//hide the loading animation
function hideLoad() {
    $('#load').hide();
}

//hide the No Beer error message until it is needed
function hideNoBeerFoundError() {
    $('#no-beer-error').hide();
}

//hide the invalid character error message until it is needed
function hideInvalidCharacterError() {
    $('#invalid-character-error').hide();
}

//Display the playlist once it has been generated
function showPlaylist() {
    $('#playlist').show();
}

//show the loading animation
function showLoad() {
    $('#load').show();
}

//show the No Beer error if beer cannot be found
function showNoBeerFoundError() {
    $('#no-beer-error').show();
}

//show the Invalid Character error if user inputs a non alphanumeric character
function showInvalidCharacterError() {
    $('#invalid-character-error').show();
}

//resets the form back to the placeholder once a beer is input
function resetFormField() {
    $('#input-beer').val('');
}

//sets the iframe for the playlist from spotify
function setPlaylistURL() {
    $('iframe').attr('src', playlistURL);
}

//shows the name of the beer that was input
function displayInputBeer() {
    $('#entered-beer').html(input);
}
// Untappd API Key
var CLIENTID = 'A9F55BC3824C82CA5DC0FBC018240C4E61ED09A1';
var CLIENTSECRET = '4C79983D9CBA23DE70A551F209EBAE2512A0BE8C';

//returns the API's beer name when the user inputs a beer
function initialQueryString(beerInput) {
    return 'search/beer?q=' + beerInput + '&';
}

//returns the API's beerID which is used on the API
function specificQueryString(beerID) {
    return 'beer/info/' + beerID + '?';
}

//queries the untapped API when the user inputs a beer
function queryURL(queryString) {
    return 'https://api.untappd.com/v4/' + queryString + 'client_id=' + CLIENTID + '&client_secret=' + CLIENTSECRET;
}

//Stops the beer loading animation
function stopAnimate() {
    $('#loader').removeClass('is-animated');
    $('#form-row').show();
}

//Animates the beer glass while waiting for the API call
function animate() {
    $('#loader').addClass('is-animated');
    $('#form-row').hide();
    return false;
}

//overarching function that prepares the site for new beer inputs
function reset() {
    hidePlaylist();
    hideLoad();
    hideNoBeerFoundError();
    hideInvalidCharacterError();
}

//Prepares the site with the loading screen, beer glass animation, beer splay, and error meesages on page load
$(document).on('ready', function () {
    reset();
    $(document).on('click', '#submit', function () {
        reset(); // for subsequent searches
        input = $('#input-beer').val().trim();
        if (input.match(/^[\w\-\s]+$/)) {
            showLoad();
            animate();
            displayInputBeer();
            setTimeout(function () {
                fetchBeers();
            }, 5000);
        } else {
            showInvalidCharacterError();
            resetFormField();
            hidePlaylist();
        }
        return false;
    });
});

//API call which takes the user input and finds that beer on the untapped API. Returns JSON data
function fetchBeers() {
    $.ajax({
        type: 'GET',
        url: queryURL(initialQueryString(input.replace(' ', '+'))),
        dataType: 'json'
    }).done(function (response) {
        if (response.response.beers.count === 0) {
            hideLoad();
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

//Once the JSON data from the API is returned, function grabs the specific beer and the data needed to pair with a spotify playlist
function fetchSpecificBeer() {
    $.ajax({
        type: 'GET',
        url: queryURL(specificQueryString(beerID)),
        dataType: 'json'
    }).done(function (response) {
        ratingCount = response.response.beer.rating_count;
        ratingScore = response.response.beer.rating_score;
        if (ratingCount && ratingScore) {
            genres = ['indie', 'rock', 'country', 'metal'];
            genre = genres[Math.floor(Math.random() * 4)];
        }
        fetchPlaylist();
    });
}

//API call which queries spotify for a playlist, using a ruby server as a proxy
function fetchPlaylist() {
    $.ajax({
        type: 'GET',
        url: 'https://rocky-island-57117.herokuapp.com/api/playlists?genre=' + genre,
        dataType: 'json'
        //Returns playlist info, stops the loading animation, stores values in the Firebase database, and displays playlist 
    }).done(function (response) {
        playlistName = response.name;
        playlistURL = response.external_urls.spotify.replace('http://open.', 'https://embed.');
        resetFormField();
        setPlaylistURL();
        hideLoad();
        stopAnimate();
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

//Grabs the 10 most recent beer searches and their playlists
database.ref().orderByChild('timestamp').limitToLast(10).on('child_added', function(childSnapshot, prevChildKey) {
    var recentBeer = childSnapshot.val().beerReturned;
    var recentPlaylist = childSnapshot.val().playlist;
    var tableRow = $('<tr>');
    var recentBeerCell = $('<td>').html(recentBeer);
    var recentPlaylistCell = $('<td>').html(recentPlaylist);

//Displays the last 10 searches
    tableRow.append(recentBeerCell).append(recentPlaylistCell);
    $('#beer-list').prepend(tableRow); 

    //Displays the most recent beer search as the placeholder text
    $("#input-beer").attr("placeholder", recentBeer).focus().blur();
});
