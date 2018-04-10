// Dependencies
var express = require( 'express' );
var router = express.Router();

/** Array for all messages ( User's and AI's )
    {
      text: String,     // Content of the message
      bot: Boolean      // Whether or not the message was from the AI
    }
*/
var msgArray = [];

// Express Routes
router.get( '/', function( req, res ) {
    res.render( 'index', { msgArray: msgArray } );
});

// Route for User sending a message
router.post( '/', function( req, res ) {
    // If there is no message, do nothing and display the same page
    if( !req.body.msg ) return res.render( 'index', { msgArray: msgArray } );
    
    // Else, save the User's message, and re-render
    msgArray.push({ text: req.body.msg, bot: false });
    res.redirect( '/' );
});

module.exports = router;
