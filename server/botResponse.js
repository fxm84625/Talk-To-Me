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
var questionArray = [
    'How are you?',
    'How is your day going?',
    'How was your day?',
    'How have you been?'
];

var negativeArray = [
    'Oh no, What happened',
    'What\'s wrong',
    'How did this happen',
    'Is everything, ok?'
];

var positiveArray = [
    'That sounds nice. What happened',
    'Awesome! What happened',
    ''
];

var neutralArray = [
    'Do you want to explain more?',
    'That\'s interesting. Do tell.',
    'Keep going!'
];

function botResponse( dialogFlowResult, userStates, prevUserStates ) {
    // If the User gave a greeting, give the greeting response
    if( dialogFlowResult.action === 'input.welcome' ) {
        return dialogFlowResult.fulfillment.speech + questionArray[Math.floor(Math.random() * questionArray.length)];
    }
    var response = '';
    if(prevUserStates > userStates) {
        if(dialogFlowResult.action === 'input.unknown') {
            return negativeArray[Math.floor(Math.random() * negativeArray.length)] + '?';
        } else if(dialogFlow.parameters["given-name"].length) {
            return negativeArray[Math.floor(Math.random() * negativeArray.length)] + `with ${dialogFlow.parameters["given-name"][0]}?`;
        } else if(dialogFlow.parameters["geo-city"]) {
            return negativeArray[Math.floor(Math.random() * negativeArray.length)] + `at ${dialogFlow.parameters["geo-city"][0]}?`;
        } else {
            return negativeArray[Math.floor(Math.random() * negativeArray.length)] + '?';
        }
    } else if (prevUserStates < userStates) {
        if(dialogFlowResult.action === 'input.unknown') {
            return postiveArray[Math.floor(Math.random() * postiveArray.length)] + '?';
        } else if(dialogFlow.parameters["given-name"].length) {
            return postiveArray[Math.floor(Math.random() * postiveArray.length)] + `with ${dialogFlow.parameters["given-name"][0]}?`;
        } else if(dialogFlow.parameters["geo-city"]) {
            return postiveArray[Math.floor(Math.random() * postiveArray.length)] + `at ${dialogFlow.parameters["geo-city"][0]}?`;
        } else {
            return postiveArray[Math.floor(Math.random() * postiveArray.length)] + '?';
        }
    } else {
        return neurtralArray[Math.floor(Math.random() * neurtralArray.length)];
    }
    return response;
}

module.exports = botResponse;
