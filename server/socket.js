// Dependencies
var Sentiment = require( 'sentiment' );
// var pythonAiResponse = require( '../py/python.js' );
var getBotResponse = require( './botResponse.js' );
var fetch = require( 'node-fetch' );
// Token to get responses from DialogFlow ( Empathy Bot )
if( !process.env.API_AI_ACCESS_TOKEN ) { throw new Error( 'process.env.API_AI_ACCESS_TOKEN not found' ); process.exit(1); return; }

/** Save each User's chat history with the Empathy bot
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
/** Save each User's emotional state using relative numerical values
    The keys of the userChats object are each Socket's Id, and the values are an array of numbers
    The array will contain "totalScore", and "comparativeScore"
        totalScore: total calculated score from User's words ( each word is scored from -4 to +4 )
        comparativeScore: total comparative score from each User's sentence. Each sentence's score is the totalScore of that sentence divided by the number of words
    {
        socketId: [ totalScore, comparativeScore ]
    }
*/
var userStates = {};
/** The Empathy bot only responds a short time after the user stops talking
    We do not want to interrupt them while they are talking, or still typing / speaking
    The keys of the botMsgTimer object are each Socket's Id, and the values are timeout functions, that will run after a period of time ( default: 4 seconds )
*/
var botMsgTimer = {};
var defaultBotWaitTime = 4000;

// Function to start a timeout for the Empathy bot's response
function startBotMsgTimeout( socket ) {
    // Clear an existing timed-out bot response if there is one
    if( botMsgTimer[ socket.id ] ) clearTimeout( botMsgTimer[ socket.id ] );
    if( !userChats[ socket.id ] ) return;
    botMsgTimer[ socket.id ] = setTimeout( function() {
        // Get all User's sentiment data for the User's responses since the last time the Empathy bot gave a response
        var sentimentArray = [];
        // Loop through the messages of the User's chat in reverse order
        // Don't respond if there are no messages, or if the last message was a bot message
        if( !userChats[ socket.id ] ) return;
        if( !userChats[ socket.id ].length ) return;
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
            if( !userChats[ socket.id ][i].bot ) sentimentArray.push( Sentiment( userChats[ socket.id ][i].text ) );
            else break;
        }
        sentimentArray = sentimentArray.reverse();
        var userText = '';
        // Read all Sentiment data, and update the User's emotional state using estimated numerical value
        if( !userStates[ socket.id ] ) userStates[ socket.id ] = [ 0, 0 ];
        for( var i = 0; i < sentimentArray.length; i++ ) {
            userStates[ socket.id ][0] += sentimentArray[i].score;
            userStates[ socket.id ][1] += sentimentArray[i].comparative;
            for( var j = 0; j < sentimentArray[i].tokens.length; j++ ) {
                userText += sentimentArray[i].tokens[j];
                if( j !== sentimentArray[i].tokens.length - 1 ) userText += ' ';
            }
            userText += '.';
            if( i !== sentimentArray.length - 1 ) userText += ' ';
        }
        /* // Python method of getting responses - Unused
        pythonAiResponse( { numRecent: numRecent, sentimentArray: sentimentArray.reverse() }, function( error, response ) {
            if( error ) return console.log( "Error getting Ai resposne:\n\t" + error );
            var botMessage = { text: response, bot: true };
            userChats[ socket.id ].push( botMessage );
            socket.emit( 'renderMessage', botMessage );
        }); */
        // Generate the Empathy bot's reply message, based on the user's messages
        fetch( 'https://api.dialogflow.com/v1/query?v=20150910', {
            method: 'POST',
            headers: { "Authorization": "Bearer " + process.env.API_AI_ACCESS_TOKEN, "Content-Type": "application/json" },
            body: JSON.stringify({
                sessionId: "talkbotxm84625",
                lang: 'en',
                query: userText
            })
        }).then( response => response.json() )
        .then( response => {
            var dialogFlowResult = response.result;
            var botResponse = getBotResponse( dialogFlowResult, userStates[ socket.id ] );
            var botMessage = { text: botResponse, bot: true };
            userChats[ socket.id ].push( botMessage );
            socket.emit( 'renderMessage', botMessage );
        })
        .catch( error => console.log( "Error getting response from DialogFlow:\n" + error ) );
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
            startBotMsgTimeout( socket );
        });

        // Event: User is active ( talking or typing ) - make sure that the Empathy bot does not interrupt them
        socket.on( 'active', function() {
            startBotMsgTimeout( socket );
        });

        // Event: User disconnects, either by refreshing or closing the web page
        socket.on( 'disconnect', function() {
            clearTimeout( botMsgTimer[ socket.id ] );
            delete userChats[ socket.id ];
            delete userStates[ socket.id ];
            delete botMsgTimer[ socket.id ];
        });
    });
}

module.exports = socketEvents;
