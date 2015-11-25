/*
 * Sam Garfield
 * server.js
 * Developed 12/16/14
 * Revised 11/25/15
 *
 * This is the interface and back-end code that reads user input and
 * returns viable running routes from a database. It also allows users
 * to submit their own runs, under the right conditions.
 *
 * Uses: Javascript, AngularJS, Express.js, MongoDB, HTML/CSS
 * HTML/CSS Web Pages <--> AngularJS Server/View Communicator <--> Express.js Server <--> Mongo Database
 */

/* More Ideas:
        - Have a "hilly" boolean value for each run
        - Bathroom friendliness rating?
*/
var express        = require('express');
var app            = express();                               // create our app w/ express
var mongoose       = require('mongoose');                     // mongoose for mongodb
var bodyParser     = require('body-parser');    // pull information from HTML POST (express4)

// configuration =================

var port = process.env.PORT || 8080;
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/runs';
mongoose.connect(mongoUri);     // connect to mongoDB database
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
    // yay!
});

app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

// define model
var Run = mongoose.model('Run', {
        name : String,
        gdist: Number,
        bdist: Number,
        url: String,
        desc: String
    });

app.get('/api/runs', function(req, res) {
        Run.find(function(err, runs) {
                if (err) {
                        res.send(err)
                }
                res.send(JSON.stringify(runs));
        });
});

/* 
This is the main method we want the application to complete.
When we submit the form on the choose-run page, this method
is called, retrieving the specific runs based on the user specs.
Angular deals with the front-end details, meaning we don't
have to send HTML here. We just send the JSON Run objects
and Angular will make sure the elements go to the right places.   
*/
app.post('/choose-run', function(req, res) {

    /* check if location is gantcher or baronian */
    var location = req.body.location;
    /* check if distance is between 0 and 100 exclusive */
    var distance = parseFloat(req.body.dist);
    /* check if range is between 0 and 3(?) inclusive */
    var range = parseFloat(req.body.range);
    
    //validator.escape(req.body);

    if (location == "gantcher") {
        /* sort Gantcher runs in ascending order */
        Run.find({
            gdist: { $gte: distance - range, $lte: distance + range }
        })
        .sort({ gdist: 1 })
        .exec(function(err, runs) {
            if (err) {
                res.send(err);
            }
            res.send(JSON.stringify(runs));
        });
    } else {
        /* sort Baronian runs in ascending order */
        Run.find({
            bdist: { $gte: distance - range, $lte: distance + range }
        })
        .sort({ bdist: 1 })
        .exec(function(err, runs) {
            if (err) {
                res.send(err);
            }
            res.send(JSON.stringify(runs));
        });
    }
});

/*
When a user attempts to add a run, the page
should send a message right away using AJAX.
This is the method that displays the success
or failure of adding a run, making it easy for
a user to edit and re-submit a run if it didn't
work the first time. (Is that how it will work?)

If the method does work, we should print out the
parameters of the new run to the user, with a success
message. Something like:

Success! [Run name] was added to the database.

or

Error! [Run name] already exists.

or

Error! Invalid parameters (can we specify which?)

The method should check that:
    - A run exists already
    - The parameters are all valid
If either of these are disobeyed, there should
be an error message made by Angular.
*/
app.post('/add-run', function(req, res) {

    /* have to come back and validate this input */
    var toReturn = {};

    Run.create({
        name : req.body.name,
        gdist: req.body.gdist,
        bdist: req.body.bdist,
        url  : req.body.url,
        desc : req.body.desc,
        done : false
    }, function(err, run) {
        if (err) {
            res.send(err);
        }
        // get and return all the runs after you create another
        Run.find(function(err, runs) {
            if (err) {
                res.send(err)
            }
            runs.forEach(function(run) {
                if (run.name == req.body.name) {
                    toReturn = run;
                }
            })
            res.json(toReturn);
        });
    });
});

// application -------------------------------------------------------------
app.get('/', function(req, res) {
    app.get('/api/runs'); // get/set the total number of runs
    res.sendfile('./public/index.html'); // home page
});

app.get('/choose-run', function(req, res) { // this is where the application really is (angular will handle the page changes on the front-end)
    res.sendfile('./public/choose-run.html');
});

app.get('/add-run', function(req, res) { // angular should send a success/failure message once a run is added/attempted to be added
    res.sendfile('./public/add-run.html');
});

app.get('/*', function(req, res) {
    res.send(404);
});

// listen (start app with node server.js) ======================================
app.listen(port);