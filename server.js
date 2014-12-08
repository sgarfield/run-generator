// Express initialization
var express = require('express');
var bodyParser = require('body-parser');
var validator = require('validator'); // Use to validate input!
var app = express();
// See https://stackoverflow.com/questions/5710358/how-to-get-post-query-in-express-node-js
app.use(bodyParser.json());
// See https://stackoverflow.com/questions/25471856/express-throws-error-as-body-parser-deprecated-undefined-extended
app.use(bodyParser.urlencoded({ extended: true }));

// Mongo initialization, setting up a connection to a MongoDB  (on Heroku or localhost)
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/runs';
var mongo = require('mongodb');
var collections = ["gantcher","baronian"];
var db = mongo.Db.connect(mongoUri, function (error, databaseConnection) {
        db = databaseConnection;
        if (db){
                db.createCollection("gantcher", function (err, collection){
                        if (err) throw err;
                });
                db.createCollection("baronian", function (er, collection){
                        if (er) throw er;
                });
        }
});

app.get('/', function (req, res) {
        res.set('Content-Type', 'text/html');
        var html = '<h1>Run Generator</h1>' +
                   '<form action="/" method="post">' +
                   '<br><br>Where are you running from? ' +
                   '<select name="location">' +
                   '<option value="Gantcher">Gantcher</option>' +
                   '<option value="Baronian">Baronian</option>' +
                   '</select>' + 
                   '<br><br>How far do you want to run? ' +
                   '<input type="text" name="distance" /> mile(s)' +
                   '<br><br>Give or take how many miles? ' +
                   '<select name="range">' +
                   '<option value="1">1</option>' +
                   '<option value="2">2</option>' +
                   '<option value="3">3</option>' +
                   '</select>' + 
                   '<br><br>' +
                   '<button type="submit">Submit</button>' +
                   '</form>';
        res.send(html);
});

/* This route will take in the input from the home page */
app.post('/', function (req, res) {

        var message = ""; /* error message */

        /* sanitize this input! */
        validator.escape(req.body);

        var location = req.body.location.toLowerCase(); /* safe because of select tag; also have to lowercase the name for database lookup */
        var range = req.body.range; /* also safe because of select tag */

        /* checking for float or int value, and character length */
        if (validator.isFloat(req.body.distance) || validator.isInt(req.body.distance)) {
                if (validator.isLength(req.body.distance, 1, 5))
                        var distance = parseFloat(req.body.distance);         
                else
                        message += "Invalid run length\n";
        } else {
                message += "Not a valid number\n";
        }

        /* Now I have access to variables location and distance ! */
        // var html = 'You want to run from ' + location + ' and you want to run ' + distance + ' miles.<br>' +
        //      '<a href="/">Search for another run</a>';
        // res.send(html);
        /* I have two options. I can either:
                a. Find the run with the closest approximation to the inputted run, or
                b. Find a list of runs within the inputted range
                        - I'm gonna try b because that seems like something people would like more
           Once I do that, I'll send back the data for:
           1. The run name
           2. The distance
           3. The URL linking to the run map
           I need an array of some sort to store the indices...but also fill it dynamically...
           I can use .push!
           input: 14
           run dist: 13.5
           range: 1
           I wanna know: is (Math.abs(13.5 - 14) < 1)
        */
        var html = "";
        var indices = [];
        if (message == "") {
                db.collection(location, function(er, collection) {
                        collection.find().toArray(function(err, cursor) {
                                if (!err) {
                                        html += "<!DOCTYPE HTML><html><head><title>Available Runs</title></head><body><h1>Your Options</h1>";
                                        /* fetching algorithm; returns the index array of the entries whose distance is within range of the inputted distance */
                                        for (var i = 0; i < cursor.length; i++) {
                                                if (Math.abs(cursor[i].dist - distance) <= range) {
                                                        indices.push(i);
                                                }
                                        }
                                        /* now we go through indices and print out our options */
                                        if (indices.length == 0) {      /* didn't find anything! */
                                                html += "<p>Couldn't find any runs meeting those conditions</p></body></html>";
                                                res.send(html);
                                        } else {
                                                //indices.sort(function(a,b) { return a - b; });
                                                for (var j = 0; j < indices.length; j++) {
                                                        /* should I make this a table? */
                                                        /* for now it is just raw html info */
                                                        html += "<h2>" + cursor[indices[j]].name + "</h2>" +
                                                                "<h4>" + cursor[indices[j]].dist + " miles</h4>" +
                                                                "<h4><a href=" + cursor[indices[j]].url + ">Route map</a></h4>";

                                                }
                                                html += "<a href='/'>Search for another run</a></body></html>";
                                                res.send(html);
                                        }
                                } else {
                                        html += "<a href='/'>Oops! Something went wrong! Search for another run</a></body></html>";
                                        res.send(html);
                                }
                        });
                });
        } else {
                res.send(message);
        }

});

app.get('/addRun', function (req, res) {
        var html = '<!DOCTYPE HTML><html><head><title>Add Run</title></head><body><h1>Add a run</h1>' +
                   '<form action="/addRun" method="post">' +
                   'Where does the run start from? ' +
                   '<select name="col">' +
                   '<option value="Gantcher">Gantcher</option>' +
                   '<option value="Baronian">Baronian</option>' +
                   '</select>' + 
                   '<br><br>What is the name of the run? ' +
                   '<input type="text" name="name" />' +
                   '<br><br>How far is the run? ' +
                   '<input type="text" name="dist" />' +
                   '<br><br>Please provide a gmap-pedometer URL for this run: ' +
                   '<input type="text" name="url" />' +
                   '<br><br>' +
                   '<button type="submit">Submit</button>' +
                   '</form></body></html>';
        res.send(html);

});
/* This will allow for more runs to be added without halting the app */
/* Of course there are some security issues with this, but the input it at least sanitized */
app.post('/addRun', function (req, res) {

        validator.escape(req.body);     /* preventing XSS */

        var col;
        var message = "";

        /* checking validity of collection input */
        if (req.body.col) {
                if (validator.equals(req.body.col.toLowerCase(), 'gantcher')) {
                        col = req.body.col.toLowerCase();
                } else if (validator.equals(req.body.col.toLowerCase(), 'baronian')) {
                        col = req.body.col.toLowerCase();
                } else {
                        message += "<p>Invalid location:" + req.body.col + "</p>";
                }
        } else {
                message += "<p>You did not submit a location</p>";
        }

        /* checking validity of name input */
        if (req.body.name) {
                if (validator.isLength(req.body.name, 1, 20)) {
                        var name = req.body.name;
                } else {
                        message += "<p>Invalid name: " + req.body.name + "</p>";
                }
        } else {
                message += "<p>You did not submit a name!</p>";
        }

        /* checking validity of distance input */
        if (req.body.dist) {
                if (validator.isFloat(req.body.dist) || validator.isInt(req.body.dist)) {
                        if (validator.isLength(req.body.dist, 1, 5))
                                var dist = parseFloat(req.body.dist);         
                        else
                                message += "<p>Invalid run length</p>";
                } else {
                        message += "<p>Not a valid distance: " + req.body.dist + "</p>";
                }
        } else {
                message += "<p>You did not submit a distance</p>";
        }

        /*checking validity of url input */
        if (req.body.url) {
                if (validator.isURL(req.body.url)) {
                        if (validator.contains(req.body.url, "gmap-pedometer") || validator.contains(req.body.url, "favoriterun"))
                                var url = req.body.url;
                        else
                                message += "<p>Invalid website name</p>";
                } else {
                        message += "<p>Not a URL: " + req.body.url + "</p>";
                }
        } else {
                message += "<p>You did not submit a URL</p>";
        }

        if (message == "") {
                var toInsert = {
                        "name":name,
                        "dist":dist,
                        "url":url
                };
                var html = "<!DOCTYPE HTML><html><head><title>Run Submission</title></head><body>";

                db.collection(col, function (er, collection) {
                        collection.find().toArray(function (err, cursor) {
                                if (!err) {
                                        for (var i = 0; i < cursor.length; i++) {
                                                if (name.toLowerCase() == cursor[i].name.toLowerCase()) {
                                                        html += "<p>This run is already in the database!" +
                                                                "(Perhaps you got mixed up with Gantcher and Baronian?)" + 
                                                                "<br><a href='/'>Search for a run</a><br><a href='/addRun'>Add a run</a></p>";
                                                }
                                        }
                                        if (html == "<!DOCTYPE HTML><html><head><title>Run Submission</title></head><body>") {    //only store into database if no problems occurred!
                                                var id = collection.insert(toInsert, function(err, saved) {
                                                        if (err) {
                                                                html += "<p>Error storing into database</p>";
                                                        }
                                                        else {
                                                                html += "<p>Success!<br><a href='/'>Search for a run</a><br><a href='/addRun'>Add another run</a></p>";
                                                                res.send(html);
                                                        }
                                                });
                                        } else {
                                                res.send(html);
                                        }
                                }
                        });
                });
        } else {
                res.send(message);
        }
});

// Oh joy! http://stackoverflow.com/questions/15693192/heroku-node-js-error-web-process-failed-to-bind-to-port-within-60-seconds-of
app.listen(process.env.PORT || 3000);

