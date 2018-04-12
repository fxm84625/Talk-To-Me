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
    The keys of the botMsgTimer object are each Socket's Id, and the values are integers, representing that period of time ( default: 3 seconds )
    {
      socketId: Number
    }
*/
var botMsgTimer = {};

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
            
            /** Get sentiment data from the user's message ( numbers indicating whether the message was positive or negative )
                {
                  score: Integer - a calculated number,
                  comparative: Integer
                  tokens: Array of all words in the sentence,
                  words: Array of key words,
                  positive: Array of positive words,
                  negative: Array of negative words
                }
            */
            var userSentimentObj = Sentiment( socketData );
            
            // Get the Empathy bot's response using the sentiment data as an argument, and render it on their page
            pythonAiResponse( userSentimentObj, function( error, response ) {
                if( error ) return console.log( "Error getting Ai resposne:\n" + error );
                var botMessage = { text: response, bot: true };
                userChats[ socket.id ].push( botMessage );
                socket.emit( 'renderMessage', botMessage );
            });
        });
        // Event: User disconnects, either by refreshing or closing the web page
        socket.on( 'disconnect', function() {
            delete userChats[ socket.id ];
            delete botMsgTimer[ socket.id ];
        });
    });
}

module.exports = socketEvents;
