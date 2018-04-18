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
*/
function botResponse( dialogFlowResult, userStates ) {
    // If the User gave a greeting, give the greeting response
    if( dialogFlowResult.action === 'input.welcome' ) return dialogFlowResult.fulfillment.speech;
    var response = '';
    return response;
}

module.exports = botResponse;
