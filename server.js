var compression = require('compression');
var express      = require('express');
var apicache     = require('apicache').options({ debug: false }).middleware;
var morgan       = require('morgan');

var app = express();

// Comprimi risultati delle richieste ove possibile
// @see https://github.com/expressjs/compression
app.use(compression());
// Log
app.use(morgan('common'));
// Servo path
require('./routes.js')(app, apicache);

var server = app.listen(8080, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Server listening at http://%s:%s', host, port);
});
