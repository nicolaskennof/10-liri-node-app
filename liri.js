// Requires
require("dotenv").config();
var keys = require("./keys.js");
var request = require("request");
var Spotify = require("node-spotify-api");
var moment = require("moment");
var fs = require("fs");


// Global variables
var divider = "\n--------------------------------\n"
var command = process.argv[2];
var search = process.argv.splice(3).join("+");
doWhatIwant();

// In order to be able to execute the do-what-it-says command, we put all the different commands in a function.
// If we modify the content of the random.txt file, it will still work if the commands are correct in the random.txt file.
function doWhatIwant() {
    switch (command) {
        // Command concert-this
        case "concert-this":
            var artist = search;
            var bitQueryUrl = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=" + keys.bandsInTownKey;
            request(bitQueryUrl, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    var concerts = JSON.parse(body);
                    for (i = 0; i < concerts.length; i++) {
                        appendFile("Name: " + concerts[i].venue.name + " / City: " + concerts[i].venue.city + " / Country: " + concerts[i].venue.country + " / Time: " + moment(concerts[i].datetime).format("MM/DD/YYYY") + "\n" + divider);
                    };
                }
            });
            break;
        // Command spotify-this-song
        case "spotify-this-song":
            var spotifyType = "track";
            var spotifyQuery = search;
            var spotify = new Spotify(keys.spotify);
            if(!spotifyQuery) spotifyQuery = "The Sign";
            spotify.search({ type: spotifyType, query: spotifyQuery }, function (err, data) {
                if (err) {
                    return console.log("Error occurred: " + err);
                }
                else {
                    for (i = 0; i < data.tracks.items.length; i++) {
                        var artists = [];
                        for (j = 0; j < data.tracks.items[i].artists.length; j++) {
                            artists.push(data.tracks.items[i].artists[j].name);
                        }
                        appendFile("Artists: " + artists.join(", "));

                        appendFile("Song name: " + data.tracks.items[i].name);
                        appendFile("Spotify Preview: " + data.tracks.items[i].external_urls.spotify);
                        appendFile("Album Name: " + data.tracks.items[i].album.name);
                        appendFile(divider)
                    }
                }
            });
            break;
        // Command movie-this
        case "movie-this":
            var movieTitle = search;
            if(!movieTitle) movieTitle = "Mr. Nobody";
            var omdbQueryUrl = "https://www.omdbapi.com/?t=" + movieTitle + "&y=&plot=short&apikey=" + keys.omdbKey;
            request(omdbQueryUrl, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    var movie = JSON.parse(body);
                    appendFile("Title: " + movie.Title + " / Year: " + movie.Year + " / IMDB Rating: " + movie.imdbRating + " / Rotten Tomatoes Rating: " + movie.Ratings[1].Value + " / Country: " + movie.Country + " / Language: " + movie.Language + " / Plot:" + movie.Plot + " / Actors: " + movie.Actors + divider);
                }
            });
            break;
        
        // Command do-what-it-says
        case "do-what-it-says":
            fs.readFile("random.txt", "utf8", function (error, data) {
                if (error) {
                    return console.log(error);
                }
                var dataArr = data.split(",");
                command = dataArr[0],
                search = dataArr[1]
                doWhatIwant();
            });
            break;
    };
}

// In order to append AND console.log we created the following function that we call in all the above commands
function appendFile(text) {
    fs.appendFileSync("log.txt", text + divider);
    console.log(text);
}