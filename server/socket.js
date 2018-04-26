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
          text: String,   // Contents of the message
          bot: Boolean    // Whether or not the message was from a bot
        }
      ]
    }
*/
var userChats = {};
function sendBotMsg( text, socket ) {
    var botMessage = { text: text, bot: true };
    userChats[ socket.id ].push( botMessage );
    socket.emit( 'renderMessage', botMessage );
}
/** Save each User's emotional state using relative numerical values
    The keys of the userChats object are each Socket's Id, and the values are an array of numbers
    The array will contain "totalScore", and "comparativeScore"
        totalScore: Integer, total calculated score from User's words ( each word is scored from -4 to +4 )
        comparativeScore: Integer, total comparative score from each User's sentence. Each sentence's score is the totalScore of that sentence divided by the number of words
        breatheEvent: String, status for when the Empathy bot activates the breathing exercise: "active", "inactive", "cancelled"
    {
        socketId: [ totalScore, comparativeScore, breatheEvent ]
    }
*/
var userStates = {};
/** The Empathy bot only responds a short time after the user stops talking
    We do not want to interrupt them while they are talking, or still typing / speaking
    The keys of the botMsgTimer object are each Socket's Id, and the values are timeout functions, that will run after a period of time ( default: 4 seconds )
*/
var botMsgTimer = {};
var defaultBotWaitTime = 4000;
function clearBotTimeouts( socketId ) {
    if( !botMsgTimer[ socketId ] ) {
        botMsgTimer[ socketId ] = [];
        return;
    }
    for( var i = 0; i < botMsgTimer[ socketId ].length; i++ ) {
        clearTimeout( botMsgTimer[ socketId ][i] );
    }
    botMsgTimer[ socketId ] = [];
}

// Function to start a timeout for the Empathy bot's response
function startBotMsgTimeout( socket ) {
    // Clear existing timed-out bot responses
    clearBotTimeouts( socket.id );
    if( !botMsgTimer[ socket.id ] ) botMsgTimer[ socket.id ] = [];
    botMsgTimer[ socket.id ].push( setTimeout( function() {
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
        if( !userStates[ socket.id ] ) userStates[ socket.id ] = [ 0, 0, "inactive" ];
        var prevUserStates = userStates[ socket.id ].slice();
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
            // Get text data from DialogFlow, and generate a response for the Empathy bot
            var dialogFlowResult = response.result;
            if( userStates[2] === "active" ) userStates[2] = "cancelled";
            var botResponse = getBotResponse( socket.id, dialogFlowResult, userStates[ socket.id ], prevUserStates );
            sendBotMsg( botResponse, socket );
            // Check for any events for the Empathy bot to run ( ex. "Let's take a moment to breathe." )
            var botEvent = getBotMsgEvent( botResponse );
            if( botEvent === 'breathe' ) {
                userStates[2] = "active";
                startBreatheEvent( socket );
            }
            if( botEvent === 'story' ) {
                userStates[2] = "active";
                startStoryEvent( socket );
            }
        })
        .catch( error => console.log( "Error getting response from DialogFlow:\n" + error ) );
    }, defaultBotWaitTime ) );
}

// Server side Socket event handlers. The Client side Socket event handlers are in /public/main.js
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
        socket.on( 'active', function() { startBotMsgTimeout( socket ); });

        // Event: User disconnects, either by refreshing or closing the web page
        socket.on( 'disconnect', function() {
            clearBotTimeouts( socket.id );
            delete userChats[ socket.id ];
            delete userStates[ socket.id ];
            delete botMsgTimer[ socket.id ];
        });
    });
}

// Function to read the Empathy bot's response, and see if there are any specific events
//      Events: "breathe"
function getBotMsgEvent( text ) {
    var splitString = text.split( ' ' );
    for( var i = 0; i < splitString.length; i++ ) {
        if( breatheKeyWords.includes( splitString[i] ) ) return 'breathe';
        if( storyKeyWords.includes( splitString[i] ) ) return 'story';
    }
    return '';
}
var storyKeyWords = [
    'story', 'story,','story.','story?','storytelling', 'stories',
    'stories?','stories!','stories,', 'storytelling,','storytelling?',
    'storytime','storytime!','storytime?','storytime,',
]

var breatheKeyWords = [ 'breath',    'breath.',    'breath,',    'breath?',    'breath?.',
                        'breathe',   'breathe.',   'breathe,',   'breathe?',   'breathe?.',
                        'breathing', 'breathing.', 'breathing,', 'breathing?', 'breathing?.' ];
var breatheResolvedResponse = [
    "How do you feel now?",
    "How are you feeling now?",
    "I hope you are feeling better."
];

// Events for the Empathy bot to run
var breatheEventDelay = 4000;
function startBreatheEvent( socket ) {
    // Bot messages starting with ":" character are appended to the previous message
    // Bot messages that are equal to ":del" removes the previous message
    // Only messages without a ":" character are spoken through text-to-speech
    clearBotTimeouts( socket.id );
    botMsgTimer[ socket.id ].push( setTimeout( function() {
        sendBotMsg( "Ready?", socket );
        sendBotMsg( ":Feel free to stop at any time. Please do not strain yourself.", socket );
    }, breatheEventDelay ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( "Inhale", socket ); }, breatheEventDelay +  1500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":4", socket ); },     breatheEventDelay +  1500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":3", socket ); },     breatheEventDelay +  2500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":2", socket ); },     breatheEventDelay +  3500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":1", socket ); },     breatheEventDelay +  4500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":del", socket ); },   breatheEventDelay +  5500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( "Hold", socket ); },   breatheEventDelay +  5500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":4", socket ); },     breatheEventDelay +  5500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":3", socket ); },     breatheEventDelay +  6500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":2", socket ); },     breatheEventDelay +  7500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":1", socket ); },     breatheEventDelay +  8500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":del", socket ); },   breatheEventDelay +  9500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( "Exhale", socket ); }, breatheEventDelay +  9500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":6", socket ); },     breatheEventDelay +  9500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":5", socket ); },     breatheEventDelay + 10500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":4", socket ); },     breatheEventDelay + 11500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":3", socket ); },     breatheEventDelay + 12500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":2", socket ); },     breatheEventDelay + 13500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":1", socket ); },     breatheEventDelay + 14500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":del", socket ); },   breatheEventDelay + 15500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( "Hold", socket ); },   breatheEventDelay + 15500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":2", socket ); },     breatheEventDelay + 15500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":1", socket ); },     breatheEventDelay + 16500 ) );
    // Repeat breathing cycle
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":del", socket ); },   breatheEventDelay + 17500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( "Inhale", socket ); }, breatheEventDelay + 17500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":4", socket ); },     breatheEventDelay + 17500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":3", socket ); },     breatheEventDelay + 18500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":2", socket ); },     breatheEventDelay + 19500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":1", socket ); },     breatheEventDelay + 20500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":del", socket ); },   breatheEventDelay + 21500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( "Hold", socket ); },   breatheEventDelay + 21500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":4", socket ); },     breatheEventDelay + 21500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":3", socket ); },     breatheEventDelay + 22500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":2", socket ); },     breatheEventDelay + 23500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":1", socket ); },     breatheEventDelay + 24500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":del", socket ); },   breatheEventDelay + 25500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( "Exhale", socket ); }, breatheEventDelay + 25500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":6", socket ); },     breatheEventDelay + 25500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":5", socket ); },     breatheEventDelay + 26500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":4", socket ); },     breatheEventDelay + 27500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":3", socket ); },     breatheEventDelay + 28500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":2", socket ); },     breatheEventDelay + 29500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":1", socket ); },     breatheEventDelay + 30500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":del", socket ); },   breatheEventDelay + 31500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( "Hold", socket ); },   breatheEventDelay + 31500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":2", socket ); },     breatheEventDelay + 31500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":1", socket ); },     breatheEventDelay + 32500 ) );
    // Repeat breathing cycle
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":del", socket ); },   breatheEventDelay + 33500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( "Inhale", socket ); }, breatheEventDelay + 33500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":4", socket ); },     breatheEventDelay + 33500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":3", socket ); },     breatheEventDelay + 34500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":2", socket ); },     breatheEventDelay + 35500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":1", socket ); },     breatheEventDelay + 36500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":del", socket ); },   breatheEventDelay + 37500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( "Hold", socket ); },   breatheEventDelay + 37500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":4", socket ); },     breatheEventDelay + 37500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":3", socket ); },     breatheEventDelay + 38500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":2", socket ); },     breatheEventDelay + 39500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":1", socket ); },     breatheEventDelay + 40500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":del", socket ); },   breatheEventDelay + 41500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( "Exhale", socket ); }, breatheEventDelay + 41500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":4", socket ); },     breatheEventDelay + 41500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":3", socket ); },     breatheEventDelay + 42500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":2", socket ); },     breatheEventDelay + 43500 ) );
    botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( ":1", socket ); },     breatheEventDelay + 44500 ) );
    // End breathing cycle
    botMsgTimer[ socket.id ].push( setTimeout( function() {
        sendBotMsg( ":del", socket );
        sendBotMsg( breatheResolvedResponse[ Math.floor( Math.random() * breatheResolvedResponse.length ) ], socket );
        sendBotMsg( ':You can ask me for this "breathing exercise" again, if you want to.', socket );
    }, breatheEventDelay + 45500 ) );
}
// Story Exercise
var shortStoryArray = [
    ['A Few Words on a Page by Bob the Cyclops', 'It\'s a powerful thing to write',
    'To say what it mean','and write what you want',
    'The ability to change letters into words','words into stories',
    'and stories into adventures','You can change the look the people take on life',
    'You can change what they read and think','You can show the world who you are',
    'with just some words on a page',],
]
function startStoryEvent( socket ) {
// Bot messages starting with ":" character are appended to the previous message
// Bot messages that are equal to ":del" removes the previous message
// Only messages without a ":" character are spoken through text-to-speech
    clearBotTimeouts( socket.id );
    botMsgTimer[ socket.id ].push( setTimeout( function() {
        sendBotMsg( "Ready?", socket );
        sendBotMsg( ":Feel free to stop at any time. Please do not strain yourself.", socket );
    }, breatheEventDelay ) );
    //Story Telling Loop
    var story = shortStoryArray[0]
    console.log(story[0])
    console.log(story[1])
    var totalLength = 0;
    for (var i = 0; i < story.length; i++) {
        (function(ind) {
            botMsgTimer[ socket.id ].push( setTimeout( function() { sendBotMsg( story[ind], socket ); }, breatheEventDelay + (ind * 3000) + 1500 ));
        })(i);
        totalLength +=story[i].length
    }
    //End Story Cycle
    botMsgTimer[ socket.id ].push( setTimeout( function() {
        sendBotMsg( ":del", socket );
        sendBotMsg( breatheResolvedResponse[ Math.floor( Math.random() * breatheResolvedResponse.length ) ], socket );
        sendBotMsg( ':You can ask me for this "story exercise" again, if you want to.', socket );
    }, breatheEventDelay + (i * 3000) + breatheEventDelay +  3500) );
}
module.exports = socketEvents;
