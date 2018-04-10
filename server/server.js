// Dependencies
var express = require( 'express' );
var exphbs = require( 'express-handlebars' );
var path = require( 'path' );
var bodyParser = require( 'body-parser' );

// Set up handlebar templates
var app = express();
app.set( 'views', path.join( __dirname, '../views' ) );
app.engine( '.hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }) );
app.set( 'view engine', '.hbs' );

// Middleware
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: true }) );
app.use( express.static( path.join( __dirname, '../public' ) ) );

// Express Routes
var routes = require( '../routes/routes.js' );
app.use( '/', routes );

app.use( function( req, res, next ) {
    var err = new Error( 'Not Found' );
    err.status = 404;
    next( err );
});

module.exports = app;
