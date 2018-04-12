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
        tokensArray.push( sentimentArray[i].tokens );
        wordsArray.push( sentimentArray[i].words );
        positiveArray.push( sentimentArray[i].positive );
        negativeArray.push( sentimentArray[i].negative );
    }
    var options = {
        args: [ numRecent, scoreArray, comparativeScoreArray, tokensArray, wordsArray, positiveArray, negativeArray ]
    };
    PythonShell.run( '/py/test.py', options, callback );
}

module.exports = pythonAiResponse;
