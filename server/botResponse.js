// Arrays of messages for the Empathy bot to send, separated based on context clues.
var greetingArray = [
    'How are you?',
    'How are you today?',
    'How are you feeling today?',
    'How is your day going?',
    'How was your day?',
    'How have you been?',
];
var negativeArray = [
    'Oh no, What happened?',
    'What\'s wrong?',
    'How do you feel about that?',
    'Aw, that sucks. Can you tell me more?',
    'How did this happen?',
];
var positiveArray = [
    'That sounds nice. What happened?',
    'Awesome! What happened?',
    'Sounds good. Can you tell me more?',
    'Can you tell me more?',
    'That\'s interesting. Can you tell me more?',
];
var namePositiveArray = [
    "What happened with ",
    "Did you do anything else with ",
];
var nameNegativeArray = [
    "Oh no, what happened with ",
];
var placePositiveArray = [
    "How did you like ",
    "How was ",
    "Can you tell me about ",
];
var placeNegativeArray = [
    "How was ",
    ""
];
var breatheArray = [
    'Let\'s breathe for a moment.',
    'Let\'s just take a moment to breathe.',
    'We should take some time to breathe.',
    'I have a breathing exercise to help you relax.',
];
var breatheKeyWords = [
    'breath',    'breath.',    'breath,',    'breath?',    'breath?.',
    'breathe',   'breathe.',   'breathe,',   'breathe?',   'breathe?.',
    'breathing', 'breathing.', 'breathing,', 'breathing?', 'breathing?.'
];
var eventKeyWords = [
    'exercise', 'exercise.', 'exercise,', 'exercise?', 'exercise?.',
    'event',    'event.',    'event,',    'event?',    'event?.'
];
/** Save key words for each User, such as names and locations
    {
        socketId: {
            "given-name": [ "James", "Harry", "Robert" ],
            "geo-city": [ "Atlanta", "Ohio" ]
        }
    }
*/
var context = {};

// Function to generate a response for the Empathy bot to sent back to the User
/** dialogFlowResult is the result of the user's sentences being set to the dialogFlow API
    {
        source: 'agent',
        resolvedQuery: 'hi.',
        action: 'input.welcome',
        actionIncomplete: false,
        parameters: {},
        contexts: [],
        metadata: {
            intentId: 'e59f99ba-9c9e-455f-a540-0e9df7dd4db1',
            webhookUsed: 'false',
            webhookForSlotFillingUsed: 'false',
            intentName: 'Default Welcome Intent'
        },
        fulfillment: {
            speech: 'Good day!',
            messages: [Array]
        },
        score: 1
    }
/** userStates is an array that has emotional state data, in the form of numerical values
    userStates: [ totalScore, totalComparativeScore ]
        totalScore: total calculated score from User's words ( each word is scored from -4 to +4 )
        comparativeScore: total comparative score from each User's sentence. Each sentence's score is the totalScore of that sentence divided by the number of words
/** prevUserStates is an array that has the previous emotional state data
*/
function botResponse( socketId, dialogFlowResult, userStates, prevUserStates ) {
    // If the User gave a greeting, give the greeting response
    if( dialogFlowResult.action === 'input.welcome' ) return dialogFlowResult.fulfillment.speech + ' ' + greetingArray[ Math.floor( Math.random() * greetingArray.length ) ];
    // Event when the User asks for the breathing exercise
    var userTextSplit = dialogFlowResult.resolvedQuery.split(' ');
    for( var i = 0; i < userTextSplit.length; i++ ) {
        if( breatheKeyWords.includes( userTextSplit[i] ) ) {
            if( dialogFlowResult.action === "smalltalk.agent.can_you_help" || eventKeyWords.includes( userTextSplit[i+1] ) ) {
                return breatheArray[ Math.floor( Math.random() * breatheArray.length ) ];
            }
        }
    }
    // If the User makes general small talk, give the DialogFlow response
    if( dialogFlowResult.action.split('.')[0] === 'smalltalk' ) return dialogFlowResult.fulfillment.speech;

    // Save sentence context parameters, like places, people, and locations
    if( !context[ socketId ] ) context[ socketId ] = {};
    var existingContexts = {};
    var newContexts = {};
    for( var key in dialogFlowResult.parameters ) {
        if( !context[ socketId ][ key ] ) {
            context[ socketId ][ key ] = dialogFlowResult.parameters[ key ];
            newContexts[ key ] = dialogFlowResult.parameters[ key ];
        }
        else {
            for( var i = 0; i < dialogFlowResult.parameters[ key ].length; i++ ) {
                if( context[ socketId ][ key ].includes( dialogFlowResult.parameters[ key ][i] ) ) {
                    if( !existingContexts[ key ] ) existingContexts[ key ] = [];
                    existingContexts[ key ].push( dialogFlowResult.parameters[ key ][i] );
                }
                else {
                    if( !newContexts[ key ] ) newContexts[ key ] = [];
                    newContexts[ key ].push( dialogFlowResult.parameters[ key ][i] );
                }
            }
        }
    }

    // User's sentences are a positive increase from last time
    if( userStates[1] > prevUserStates[1] ) {
        // See if the User mentioned any new people or places
        for( var key in newContexts ) {
            if( key === "given-name" )    return namePositiveArray[ Math.floor( Math.random() * namePositiveArray.length ) ] + wordArrayToString( newContexts[ key ] ) + '?';
            else if( key === "geo-city" ) return placePositiveArray[ Math.floor( Math.random() * placePositiveArray.length ) ] + wordArrayToString( newContexts[ key ] ) + '?';
        }
        return positiveArray[ Math.floor( Math.random() * positiveArray.length ) ];
    }
    // User's sentences are negative or neutral from last time
    else if( userStates[1] <= prevUserStates[1] ) {
        if( userStates[0] <= -15 ) return breatheArray[ Math.floor( Math.random() * breatheArray.length ) ];
        // See if the User mentioned any new people or places
        for( var key in newContexts ) {
            if( key === "given-name" ) return nameNegativeArray[ Math.floor( Math.random() * nameNegativeArray.length ) ] + wordArrayToString( newContexts[ key ] ) + '?';
            else if( key === "geo-city" ) return placeNegativeArray[ Math.floor( Math.random() * placeNegativeArray.length ) ] + wordArrayToString( newContexts[ key ] ) + '?';
        }
        return negativeArray[ Math.floor( Math.random() * negativeArray.length ) ];
    }
    return '';
}

// Function to transform an array of words, concatenated into a sentence that would be said
// ex: James and Bob
//     Maria, Holly, and Julia
//     Toby
//     Georgia, and Alabama
//     Atlanta
//     China, America, and Europe
function wordArrayToString( wordArray ) {
    if( wordArray.length === 0 ) return '';
    if( wordArray.length === 1 ) return wordArray[0];
    if( wordArray.length === 2 ) return wordArray[0] + ' and ' + wordArray[1];
    var response = '';
    for( var i = 0; i < wordArray.length; i++ ) {
        response += wordArray[i];
        if( i <=  wordArray.length - 2 ) response += ', ';
        if( i === wordArray.length - 2 ) response += ' and ';
        if( i === wordArray.length - 1 ) response += '.';
    }
    return response;
}

module.exports = botResponse;
