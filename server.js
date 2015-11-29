/*
 * Sam Garfield
 * server.js
 * Developed 12/16/14
 * Revised 11/25/15
 *
 * This is the back-end server that reads/validates user input and
 * returns viable running routes from the database. It also allows users
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
var app            = express();
var mongoose       = require('mongoose');
var bodyParser     = require('body-parser');

// configuration =================

var port = process.env.PORT || 8080;
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/runs';
mongoose.connect(mongoUri);     // connect to mongoDB database
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
    // yay!
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

// define models
var Run = mongoose.model('Run', {
    name : String,
    gdist: Number,
    bdist: Number,
    url: String,
    desc: String
});

var Input = mongoose.model('Input', {
    name: String,
    dist: Number,
    range: Number
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
    var range    = parseFloat(req.body.range);
    
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
Method that allows or rejects an added run to the db
*/
app.post('/add-run', function(req, res) {

    var run_name = req.body.name;
    var g_dist   = req.body.gdist;
    var b_dist   = req.body.bdist;
    var link     = req.body.url;
    var descr    = req.body.desc;

    /* have to come back and validate this input */

    Run.find({ name: run_name })
    .exec(function(err, runs) {
        if (err) {
            res.send(err);
        }
        if (runs.length > 0) {
            //console.log("Run already exists!");
            res.send(JSON.stringify(runs));
        } else {
            Run.create({
                name : run_name,
                gdist: g_dist,
                bdist: b_dist,
                url  : link,
                desc : descr
            }, function(err, run) {
                if (err) {
                    res.send(err);
                }
                res.send(JSON.stringify(run));
            });
        }
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