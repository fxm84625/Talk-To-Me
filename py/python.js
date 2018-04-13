var PythonShell = require( 'python-shell' );

function pythonAiResponse( userSentimentObj, callback ) {
    // Array of recent messages' sentiments ( messages since the last time the Empathy bot responded )
    var numRecent = userSentimentObj.numRecent;
    // Array of all messages' sentiments
    var sentimentArray = userSentimentObj.sentimentArray;
    // Separate the score, comparativeScore, tokens, words, positive, and negative words
    var scoreArray = [], comparativeScoreArray = [], tokensArray = [], wordsArray = [], positiveArray = [], negativeArray = [];
    for( var i = 0; i < sentimentArray.length; i++ ) {
        scoreArray.push( sentimentArray[i].score );
        comparativeScoreArray.push( sentimentArray[i].comparative );
        // For the arrays that have words, triple colons ":::" are used to denote the end of one of the User's sentences
        tokensArray.push( sentimentArray[i].tokens );
        tokensArray.push( ':::' );
        wordsArray.push( sentimentArray[i].words );
        wordsArray.push( ':::' );
        positiveArray.push( sentimentArray[i].positive );
        positiveArray.push( ':::' );
        negativeArray.push( sentimentArray[i].negative );
        negativeArray.push( ':::' );
    }
    var options = {
        args: [ numRecent, scoreArray, comparativeScoreArray, tokensArray, wordsArray, positiveArray, negativeArray ]
    };
    PythonShell.run( '/py/script.py', options, callback );
}

module.exports = pythonAiResponse;
