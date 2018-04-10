/** Save each user's chat history with the Empathy bot
    The keys of the userChats object are each socket's id, and the values are an array of Message
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

module.exports = function( io ) {
    io.on( 'connection', function( socket ) {
        socket.on( 'message', function( data ) {
            if( !data ) return;
            if( !userChats[ socket.id ] ) userChats[ socket.id ] = [];
            var message = { text: data, bot: false };
            userChats[ socket.id ].push( message );
            io.to( socket.id ).emit( 'renderMessage', message );
        });
    });
}
