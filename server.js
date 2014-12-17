/*
 * Sam Garfield
 * server.js
 * Developed 12/16/14
 *
 * This is the interface and back-end code that reads user input and
 * returns viable running routes from a database. It also allows users
 * to submit their own runs, under the right conditions.
 *
 * Uses: Javascript, Node.js, Express, and MongoDB
 */

/* More Ideas:
        - Have a "hilly" boolean value for each run
        - Bathroom friendliness rating?
        - Maybe split runs by region?
        - Allowing a user to search for the run name?
                - Avoid querying
*/
var express = require('express');
var bodyParser = require('body-parser');
var validator = require('validator');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/runs';
var mongo = require('mongodb');
var db = mongo.Db.connect(mongoUri, function (error, databaseConnection) {
        db = databaseConnection;
        if (db){
                db.createCollection("runs", function (err, collection){
                        if (err) throw err;
                });
        }
});

app.get('/', function (req, res) {
        res.set('Content-Type', 'text/html');
        var link = "<p><a href='/addRun'>Add a run</a></p></div></body></html>";
        var html = '<div align="center"><h1>Run Generator</h1>' +
                   '<form action="/" method="post">' +
                   '<table cellspacing="20">' +
                   '<tr><td align="right">Where are you running from?</td>' +
                   '<td><input type="radio" name="location" value="gantcher" required>Gantcher<br>' +
                   '<input type="radio" name="location" value="baronian" required>Baronian</td>' +
                   '</tr>' +
                   '<tr><td align="right">How far do you want to run?</td>' + 
                   '<td><input name="dist" size="5" required></td>' +
                   '</tr>' +
                   '<tr><td align="right">Give or take...</td>' + 
                   '<td><select name="range" required>' +
                   '<option value="0.5">0.5 miles</option>' +
                   '<option value="1">1 mile</option>' +
                   '<option value="2">2 miles</option>' +
                   '<option value="3">3 miles</option></select></td>' + 
                   '</tr>' +
                   '</table>' +
                   '<button type="submit">Submit</button>' +
                   '</form>' + link;
        res.send(html);
});

app.post('/', function (req, res) {

        var html = "<!DOCTYPE HTML><html><head><title>Available Runs</title></head><body><div align='center'>";
        var linkBack = "<p><a href='/'>Search for another run</a></p><p><a href='/addRun'>Add a run</a></p></div></body></html>";
        var numErr = 0;

        validator.escape(req.body);

        if (req.body.location != "") {
                if (validator.equals(req.body.location, 'gantcher')) {
                        var location = 'gantcher';
                } else if (validator.equals(req.body.location, 'baronian')) {
                        var location = 'baronian';
                } else {
                        numErr++;
                        html += "<p>Invalid location</p>";
                }
        } else {
                numErr++;
                html += "<p>You did not submit a location</p>";
        }

        if (validator.isFloat(req.body.dist) || validator.isInt(req.body.dist)) {
                if (validator.isLength(req.body.dist, 1, 5))
                        var dist = parseFloat(req.body.dist);         
                else {
                        numErr++;
                        html += "<p>Invalid run length</p>";
                }
        } else {
                numErr++;
                html += "<p>Distance not a valid number</p>";
        }

        if (validator.isFloat(req.body.range) || validator.isInt(req.body.range)) {
                if (validator.isLength(req.body.range, 1, 3))
                        var range = parseFloat(req.body.range);         
                else {
                        numErr++;
                        html += "<p>Invalid range</p>";
                }
        } else {
                numErr++;
                html += "<p>Range not a valid number</p>";
        }

        var indices = [];
        var numReturned = 0;

        if (numErr == 0) {
                db.collection("runs", function(er, collection) {
                        collection.find().sort({ gdist: 1 }).toArray(function(err, cursor) {
                                if (!err) {
                                        if (location == "gantcher") {
                                                html += "<h1>Your Options from Gantcher</h1>";
                                                for (var i = 0; i < cursor.length; i++) {
                                                        if (Math.abs(cursor[i].gdist - dist) <= range) {
                                                                numReturned++;
                                                                html += "<h2>" + cursor[i].name + "</h2>" +
                                                                        "<h3>" + cursor[i].gdist + " miles</h3>" +
                                                                        "<p>" + cursor[i].desc + "</p>" +
                                                                        "<h4><a href=" + cursor[i].url + " target='_blank'>Route map</a></h4>";
                                                        }
                                                }
                                        } else {
                                                html += "<h1>Your Options from Baronian</h1>";
                                                for (var i = 0; i < cursor.length; i++) {
                                                        if (Math.abs(cursor[i].bdist - dist) <= range) {
                                                                numReturned++;
                                                                html += "<h2>" + cursor[i].name + "</h2>" +
                                                                        "<h4>" + cursor[i].bdist + " miles</h4>" +
                                                                        "<p>" + cursor[i].desc + "</p>" +
                                                                        "<h4><a href=" + cursor[i].url + " target='_blank'>Route map</a></h4>";
                                                        }
                                                }
                                        }

                                        if (numReturned > 0) {
                                                html += linkBack;
                                                res.send(html);
                                        } else {
                                                html += "<p>Couldn't find any runs meeting those conditions</p>" + linkBack;
                                                res.send(html);
                                        }
                                } else {
                                        html += "<p>Oops! Something went wrong!</p>" + linkBack;
                                        res.send(html);
                                }
                        });
                });
        } else {
                html += linkBack;
                res.send(html);
        }
});

app.get('/addRun', function (req, res) {

        var link = "<p><a href='/'>Search for a run</a></p></div></body></html>";
        var html = '<!DOCTYPE HTML><html><head><title>Add Run</title></head><body><div align="center"><h1>Add a new run</h1>' +
                   '<form action="/addRun" method="post">' +
                   '<table cellspacing="10">' +
                   '<tr><td>Run Name:</td> <td><input name="name" size="25" required></td> </tr>' +
                   '<tr><td>Gantcher Distance:</td> <td><input name="gdist" size="5" required></td> </tr>' +
                   '<tr><td>Baronian Distance:</td> <td><input name="bdist" size="5" required></td> </tr>' +
                   '<tr><td>Route Map URL:</td>     <td><input name="url" size="35" required></td> </tr>' +
                   '<tr><td></td>                   <td><i>Requires gmap-pedometer or favoriterun</i></td> </tr>' +
                   '<tr><td>Description:</td>       <td><textarea name="desc" style="resize:none;" rows=4 cols=50></textarea required></td> </tr>' +
                   '<tr><td></td>                   <td><i>(i.e. terrain, hilliness, bathroom availability, etc.)</i></td> </tr>' +
                   '</table>' +
                   '<br><br>' +
                   '<button type="submit">Submit</button>' +
                   '</form>' + link;
        res.send(html);

});

app.post('/addRun', function (req, res) {

        var html = "<!DOCTYPE HTML><html><head><title>Run Submission</title></head><body><div align='center'>";
        var linkBack = "<p><a href='/'>Search for a run</a></p><p><a href='/addRun'>Add another run</a></p></div></body></html>";
        var numErr = 0;

        validator.escape(req.body);

        if (req.body.name != "") {
                if (validator.isLength(req.body.name, 1, 25)) {
                        var name = validator.escape(req.body.name);
                } else {
                        numErr++;
                        html += "<p>Run name too long</p>";
                }
        } else {
                numErr++;
                html += "<p>You did not submit a run name</p>";
        }

        if (req.body.gdist != "") {
                if (validator.isFloat(req.body.gdist) || validator.isInt(req.body.gdist)) {
                        if (validator.isLength(req.body.gdist, 1, 5)) {
                                var gdist = parseFloat(req.body.gdist);
                        } else {
                                numErr++;
                                html += "<p>Invalid Gantcher distance</p>";
                        }
                } else {
                        numErr++;
                        html += "<p>Not a number</p>";
                }
        } else {
                numErr++;
                html += "<p>You did not submit a Gantcher distance</p>";
        }

        if (req.body.bdist != "") {
                if (validator.isFloat(req.body.bdist) || validator.isInt(req.body.bdist)) {
                        if (validator.isLength(req.body.bdist, 1, 5)) {
                                var bdist = parseFloat(req.body.bdist);
                        } else {
                                numErr++;
                                html += "<p>Invalid Baronian distance</p>";
                        }
                } else {
                        numErr++;
                        html += "<p>Not a number</p>";
                }
        } else {
                numErr++;
                html += "<p>You did not submit a Baronian distance</p>";
        }

        if (req.body.url != "") {
                if (validator.isURL(req.body.url)) {
                        if (validator.contains(req.body.url, "gmap-pedometer") || validator.contains(req.body.url, "favoriterun"))
                                var url = req.body.url;
                        else {
                                numErr++;
                                html += "<p>Invalid URL</p>";
                        }
                } else {
                        numErr++;
                        html += "<p>Not a URL</p>";
                }
        } else {
                numErr++;
                html += "<p>You did not submit a URL</p>";
        }

        if (req.body.desc != "") {
                var desc = validator.escape(req.body.desc);
        } else {
                numErr++;
                html += "<p>You did not submit a description</p>"
        }

        if (numErr == 0) {
                var toInsert = {
                        "name":name,
                        "gdist":gdist,
                        "bdist":bdist,
                        "url":url,
                        "desc":desc
                };

                db.collection("runs", function (er, collection) {
                        collection.find().toArray(function (err, cursor) {
                                if (!err) {
                                        for (var i = 0; i < cursor.length; i++) {
                                                if (name.toLowerCase() == cursor[i].name.toLowerCase()) {
                                                        numErr++;
                                                        html += "<p>This run is already in the database!</p>";
                                                }
                                        }
                                        if (numErr == 0) {
                                                var id = collection.insert(toInsert, function(err, saved) {
                                                        if (err) {
                                                                numErr++;
                                                                html += "<p>Error storing into database</p>" + linkBack;
                                                                res.send(html);
                                                        }
                                                        else {
                                                                html += "<p>Success!</p>" + linkBack;
                                                                res.send(html);
                                                        }
                                                });
                                        } else {
                                                html += linkBack;
                                                res.send(html);
                                        }
                                }
                        });
                });
        } else {
                html += linkBack;
                res.send(html);
        }
});

app.get('/*', function(req, res) {
        res.sendStatus(404);
});

app.listen(process.env.PORT || 3000);