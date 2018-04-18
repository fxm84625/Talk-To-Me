var VOICE = window.speechSynthesis.getVoices()[1];   // Voice: Microsoft Zira Desktop - English (US)
window.speechSynthesis.onvoiceschanged = function() {
    VOICE = window.speechSynthesis.getVoices()[1];
}

function useTextToSpeech( text ) {
    // Check to see if this browser supports speech synthesis ( text to speech )
    if( !('speechSynthesis' in window) ) {
        console.log( "This browser doesn't support speech synthesis ( text to speech ). Try Google Chrome or Firefox." );
    }
    var msg = new window.SpeechSynthesisUtterance();
    msg.voice = VOICE;    // Voice: Microsoft Zira Desktop - English (US)
    msg.rate = 10 / 10;
    msg.pitch = 1;
    msg.text = text;
    window.speechSynthesis.speak( msg );
}
