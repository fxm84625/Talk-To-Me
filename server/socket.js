var pythonAiResponse = require( '../py/python.js' );

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
        socket.on( 'message', function( socketData ) {
            if( !socketData ) return;
            if( !userChats[ socket.id ] ) userChats[ socket.id ] = [];
            // Save the User's message, and render it on their page
            var userMessage = { text: socketData, bot: false };
            userChats[ socket.id ].push( userMessage );
            io.to( socket.id ).emit( 'renderMessage', userMessage );
            
            // Get the empathy bot's response, and render it on their page
            pythonAiResponse( socketData, function( error, response ) {
                if( error ) return console.log( "Error getting Ai resposne:\n" + error );
                var botMessage = { text: response, bot: true };
                userChats[ socket.id ].push( botMessage );
                io.to( socket.id ).emit( 'renderMessage', botMessage );
            });
        });
    });
}

module.exports = socketEvents;
