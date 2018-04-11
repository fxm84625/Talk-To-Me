// Dependencies
var express = require( 'express' );
var router = express.Router();

// Express Routes
router.get( '/', function( req, res ) {
    res.render( 'index' );
});

module.exports = router;
