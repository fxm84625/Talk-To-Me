var PythonShell = require( 'python-shell' );

function pythonAiResponse( text, callback ) {
    var options = {
        args: text
    };
    PythonShell.run( '/py/test.py', options, callback );
}

module.exports = pythonAiResponse;
