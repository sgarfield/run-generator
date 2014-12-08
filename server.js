// Express initialization
var express = require('express');
var app = express();

// Mongo initialization, setting up a connection to a MongoDB  (on Heroku or localhost)
/*var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/whereintheworld'; // comp20 is the name of the database we are using in MongoDB
var mongo = require('mongodb');
var db = mongo.Db.connect(mongoUri, function (error, databaseConnection) {
  db = databaseConnection;
});*/

app.get('/', function (request, response) {
  response.set('Content-Type', 'text/html');
  response.send('<p>Hey, it works!</p>');
});


// Oh joy! http://stackoverflow.com/questions/15693192/heroku-node-js-error-web-process-failed-to-bind-to-port-within-60-seconds-of
app.listen(process.env.PORT || 3000);