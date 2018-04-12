var pythonAiResponse = require( '../py/python.js' );
var Sentiment = require( 'sentiment' );

/** Save each user's chat history with the Empathy bot
    The keys of the userChats object are each Socket's Id, and the values are an array of Message
    Each Message is an object that contains the contents of the message, and whether or not the message was from the bot
    {
      socketId: [
        {
          text: String,     // Contents of the message
          bot: Boolean      // Whether or not the message was from a bot
        }
      ]
    }
*/
var userChats = {};
/** The Empathy bot only responds a short time after the user stops talking
    We do not want to interrupt them while they are talking, or still typing / speaking
    The keys of the botMsgTimer object are each Socket's Id, and the values are timeout functions, that will run after a period of time ( default: 3 seconds )
*/
var botMsgTimer = {};
var defaultBotWaitTime = 5000;
// Function to start a timeout for the Empathy bot's response
function startBotMsgTimeout( socket ) {
    // Clear an existing timed-out bot response if there is one
    if( botMsgTimer[ socket.id ] ) clearTimeout( botMsgTimer[ socket.id ] );
    if( !userChats[ socket.id ] ) return;
    botMsgTimer[ socket.id ] = setTimeout( function() {
        // Number of the User's sentiment data since the last time the Empathy bot gave a response
        var numRecent = 0;
        var gotAllRecent = false;
        // Get all User's sentiment data
        var sentimentArray = [];
        // Loop through the messages of the User's chat in reverse order
        // Don't respond if there are no messages, or if the latest message was a bot message
        if( !userChats[ socket.id ] ) return;
        if( userChats[ socket.id ][ userChats[ socket.id ].length - 1 ].bot ) return;
        for( var i = userChats[ socket.id ].length - 1; i >= 0; i-- ) {
            /** Get sentiment data from the user's message ( numbers indicating whether the message was positive or negative )
                Sentiment() returns an object:
                { score: Integer - a calculated number,
                  comparative: Integer - "average score": score divided by number of words
                  tokens: Array of all words in the sentence,
                  words: Array of key words,
                  positive: Array of positive words,
                  negative: Array of negative words } */
            // Only record User messages, not the Empathy bot's messages
            if( !userChats[ socket.id ][i].bot ) {
                if( !gotAllRecent ) numRecent++;
                sentimentArray.push( Sentiment( userChats[ socket.id ][i].text ) );
            }
            else gotAllRecent = true;
        }
        // Get the Empathy bot's response using the sentiment data, and render it on their page
        pythonAiResponse( { numRecent: numRecent, sentimentArray: sentimentArray.reverse() }, function( error, response ) {
            if( error ) return console.log( "Error getting Ai resposne:\n\t" + error );
            var botMessage = { text: response, bot: true };
            userChats[ socket.id ].push( botMessage );
            socket.emit( 'renderMessage', botMessage );
        });
    }, defaultBotWaitTime );
}

function socketEvents( io, currentUrl ) {
    io.on( 'connection', function( socket ) {
        // Event: the User sends a message
        socket.on( 'message', function( socketData ) {
            if( !socketData ) return;
            if( !userChats[ socket.id ] ) userChats[ socket.id ] = [];
            // Save the User's message, and render it on their page
            var userMessage = { text: socketData, bot: false };
            userChats[ socket.id ].push( userMessage );
            socket.emit( 'renderMessage', userMessage );
        });

        // Event: User is active ( talking or typing ) - make sure that the Empathy bot does not interrupt them
        socket.on( 'active', function() {
            startBotMsgTimeout( socket );
        });

        // Event: User disconnects, either by refreshing or closing the web page
        socket.on( 'disconnect', function() {
            delete userChats[ socket.id ];
            clearTimeout( botMsgTimer[ socket.id ] );
            delete botMsgTimer[ socket.id ];
        });
    });
}

module.exports = socketEvents;
