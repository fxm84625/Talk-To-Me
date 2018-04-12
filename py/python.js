var PythonShell = require( 'python-shell' );

function pythonAiResponse( userSentimentObj, callback ) {
    var options = {
        args: [ userSentimentObj.tokens.join(' '), userSentimentObj.score, userSentimentObj.comparative ]
    };
    PythonShell.run( '/py/test.py', options, callback );
}

module.exports = pythonAiResponse;
