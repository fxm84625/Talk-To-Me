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
    'Is everything ok'
];

var positiveArray = [
    'That sounds nice. What happened',
    'Awesome! What happened',
    'Sounds good. Explain?'
];

var neutralArray = [
    'Do you want to explain more?',
    'That\'s interesting. Do tell.',
    'Keep going!'
];

var breatheArray = [
    'How about we just breathe for a moment.',
    'Let\'s just take a moment to breathe.',
    'Can we just take some time to breathe?',
    'I think we should just take time to breathe?',
]

var context = {};
/** userStates is an array that has emotional state data, in the form of numerical values
    userStates: [ totalScore, totalComparativeScore ]
        totalScore: total calculated score from User's words ( each word is scored from -4 to +4 )
        comparativeScore: total comparative score from each User's sentence. Each sentence's score is the totalScore of that sentence divided by the number of words
/** prevUserStates is an array that has the previous emotional state data
*/
function botResponse( dialogFlowResult, userStates, prevUserStates ) {
    // If the User gave a greeting, give the greeting response
    // context.push(dialogFlowResult);
    // console.log(prevUserStates, 'this is the previous user state')
    // console.log(userStates, 'this is the current user state')
    if( dialogFlowResult.action === 'input.welcome' ) {
        return dialogFlowResult.fulfillment.speech + ' ' + questionArray[Math.floor(Math.random() * questionArray.length)];
    }

    var response = '';
    if(prevUserStates[1] > userStates[1]) {
        if(dialogFlowResult.action === 'input.unknown') {
            return negativeArray[Math.floor(Math.random() * negativeArray.length)] + '?';
        } else if(dialogFlowResult.parameters["given-name"].length) {
            return negativeArray[Math.floor(Math.random() * negativeArray.length)] + ` with ${dialogFlowResult.parameters["given-name"][0]}?`;
        } else if(dialogFlowResult.parameters["geo-city"].length) {
            return negativeArray[Math.floor(Math.random() * negativeArray.length)] + ` at ${dialogFlowResult.parameters["geo-city"][0]}?`;
        } else {
            return negativeArray[Math.floor(Math.random() * negativeArray.length)] + '?';
        }
    } else if (prevUserStates[1] < userStates[1]) {
        if(userStates[0] <= -15) {
            return 'Breathe';
        }
        if(dialogFlowResult.action === 'input.unknown') {
            return positiveArray[Math.floor(Math.random() * positiveArray.length)] + '?';
        } else if(dialogFlowResult.parameters["given-name"].length) {
            return positiveArray[Math.floor(Math.random() * positiveArray.length)] + ` with ${dialogFlowResult.parameters["given-name"][0]}?`;
        } else if(dialogFlowResult.parameters["geo-city"]) {
            console.log(dialogFlowResult)
            return positiveArray[Math.floor(Math.random() * positiveArray.length)] + ` at ${dialogFlowResult.parameters["geo-city"][0]}?`;
        } else {
            return positiveArray[Math.floor(Math.random() * positiveArray.length)] + '?';
        }
    } else {
        return neutralArray[Math.floor(Math.random() * neutralArray.length)];
    }
    return response;
}

module.exports = botResponse;
