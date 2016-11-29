# BeerTunes

## Project 1 for the Northwestern Coding Boot Camp

### The App

#### The perfect playlist for your preferred pour

It's simple - enter a beer, get a playlist!

### The Players

* [Alan Ashbeck](https://github.com/a-ashbeck)
* [Chris Brenner](https://github.com/cbrenner04)
* [Adam Sidor](https://github.com/AdamSidor)
* [Max Van Bel](https://github.com/mdvb1001)

### Objectives

Use two APIs and one new technology

### APIs

* [Untappd](https://untappd.com/api/docs)
* [Spotify](https://developer.spotify.com/web-api/)

In order to use the Spotify API to get playlists (more on this below) we needed
to make the requests server-side. We therefore created an api-only Rails app.
It can be found [here](https://github.com/a-ashbeck/BrewTunes_Rails_Server).

### New Tech

* Rails
* Cordova

### The business

When the user enters a beer the Untappd API is sent a request for a list of
matching beers. Once this is returned the top beer is used to send another
request to the Untappd API for detailed information on that beer. From the
detailed information we display the beer name, brewery and label to the user.
Our algorithm takes the number of ratings and overall score of the beer and
calculates a genre. We then send a request to our Rails app with the genre. The
Rails app sends a request for 20 playlists in that genre from Spotify. The Rails
app selects one at random and sends it back to us. We use this object and
extract the url which we set in our iframe and display to the user.
