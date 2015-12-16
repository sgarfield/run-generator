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
 */

var express          = require('express');
var app              = express();
var mongoose         = require('mongoose');
var bodyParser       = require('body-parser');
var expressValidator = require('express-validator');
var util             = require('util');

// configuration ===============================================================

var port = process.env.PORT || 8080;
var mongoUri = process.env.MONGOLAB_URI 
            || process.env.MONGOHQ_URL 
            || 'mongodb://localhost/runs';
mongoose.connect(mongoUri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
//app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(expressValidator({
    customValidators: {
        validLocation: function(value) {
            return value == "Gantcher" || value == "Baronian";
        },
        gt: function(param, num) {
            return param > num;
        },
        gte: function(param, num) {
            return param >= num;
        },
        lte: function(param, num) {
            return param <= num;
        }
    }
}));

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
 * This is the main method that the application completes.
 * When the form is submitted on the choose-run page, this method
 * is called, retrieving the specific runs based on the user specs.
 * Angular deals with the front-end details, so there's no need to
 * send HTML here. We just send the JSON Run objects and Angular 
 * will make sure the elements go to the right places.   
 */
app.post('/choose-run', function(req, res) {

    req.checkBody('location').isAlpha().validLocation();
    req.sanitize('location').escape();

    req.checkBody('dist').isFloat().len(1, 4).gt(0).lte(50);
    req.sanitize('dist').escape();

    req.checkBody('range').isFloat().len(1, 3).gte(0).lte(3);
    req.sanitize('range').escape();

    var errors = req.validationErrors();
    if (errors) {
        res.send('Validation errors: ' + util.inspect(errors) + '\n', 400);
    }
    var location = req.body.location;
    var distance = parseFloat(req.body.dist);
    var range    = parseFloat(req.body.range);

    if (location == "Gantcher") {
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
        /* Baronian */
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
 * Method that allows or rejects an added run to the db
 */
app.post('/add-run', function(req, res) {

    req.checkBody('name').len(1, 30);
    req.sanitize('name').escape();

    req.checkBody('gdist').isFloat().len(1, 4).gt(0).lte(50);
    req.sanitize('gdist').escape();

    req.checkBody('bdist').isFloat().len(1, 4).gt(0).lte(50);
    req.sanitize('bdist').escape();

    req.checkBody('url').isURL();
    req.sanitize('url').escape();

    req.checkBody('desc').len(1, 100);
    req.sanitize('desc').escape();

    var errors = req.validationErrors();
    if (errors) {
        res.send('Validation errors: ' + util.inspect(errors) + '\n', 400);
        //return;
    }

    var run_name = req.body.name;
    var g_dist   = req.body.gdist;
    var b_dist   = req.body.bdist;
    var link     = req.body.url;
    var descr    = req.body.desc;

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

// application =================================================================
app.get('/', function(req, res) {
    app.get('/api/runs'); // get/set the total number of runs
    res.sendfile('./public/index.html');
});

app.get('/choose-run', function(req, res) {
    res.sendfile('./public/choose-run.html');
});

app.get('/add-run', function(req, res) {
    res.sendfile('./public/add-run.html');
});

app.get('/*', function(req, res) {
    res.send(404);
});

// listen (start app with node server.js) ======================================
app.listen(port);