$( document ).ready( function() {
    // Client side Socket connection
    // Server side Socket event handlers are in /server/socket.js
    var url = $( location ).attr( 'host' );
    var socket = io.connect( url );

    // Focus on the input element, where user's type their messages
    $( "#text-field" ).focus();
    // Scroll the message container element to the bottom, so users see the most recent messages
    $( '#msg-container' ).scrollTop( $( '#msg-container' )[0].scrollHeight );

    // Variables for the Empathy bot's voice ( text to speech ) and visual
    var voiceToggle = false;
    var visualToggle = false;
    
    // Handle toggling Empathy bot voice and visual
    $( '#voice-toggle' ).on( 'change', function() {
        voiceToggle = $( this ).prop( 'checked' );
        if( !voiceToggle ) window.speechSynthesis.cancel();
    });
    $( '#visual-toggle' ).on( 'change', function() {
        visualToggle = $( this ).prop( 'checked' );
    });

    // Functions for reading a User's speech
        // onAnythingSaid runs every time the User says something
        // Mark the User as currently active, so the Empathy bot does not interrupt them
        function onAnythingSaid( text ) {
            console.log( "onAnythingSaid: " + text );
            socket.emit( 'active' );
        }
        // onFinalised runs when the User stops talking
        function onFinalised( text ) {
            socket.emit( 'message', text );
        }
        // onFinishedListening runs when the Speech Recognition closes - unused
        function onFinishedListening() {}
    // Start event listener for Speech Recognition
    var listener = new SpeechToText( onAnythingSaid, onFinalised, onFinishedListening );
    listener.startListening();

    // Event: User is typing a message - mark the User as currently active, so the Empathy bot does not interrupt them
    $( '#msg-field' ).on( 'keydown', function() {
        socket.emit( 'active' );
    });

    // Event: User submits a typed message
    $( '#msg-submit' ).on( 'click', function( event ) {
        event.preventDefault();
        socket.emit( 'message', $( '#msg-field' ).val() );
        $( '#msg-field' ).val( '' );
    });

    // Event: Server gives a message to the User's Socket, and renders it on their page
    socket.on( 'renderMessage', function( data ) {
        if( data.bot ) {
            if( data.text === ':del' ) {
                $( '#msg-container div:last-child' ).remove();
            }
            else if( data.text[0] === ':' ) {
                // $( '#msg-container' ).append( '<div class="bot-sub-msg">' + data.text.slice(1) + '</div>' );
                var lastMsgText = $( '#msg-container div:last-child' ).text();
                $( '#msg-container div:last-child' ).text( lastMsgText + ' ' + data.text.slice(1) );
            }
            else {
                $( '#msg-container' ).append( '<div class="bot-msg">' + data.text + '</div>' );
                if( voiceToggle ) useTextToSpeech( data.text );
            }
        }
        else {
            $( '#msg-container' ).append( '<div class="user-msg"></div>' );
            // Protect against User inputting html elements
            $( '#msg-container div:last-child' ).text( data.text );
        }

        // Scroll the message container element to the bottom, so users see the most recent messages
        $( '#msg-container' ).scrollTop( $( '#msg-container' )[0].scrollHeight );
    });

    // Event: User opens the web page ( or refreshes ), previous Empathy bot speeches should be cancelled
    socket.on( 'connect', function() {
        window.speechSynthesis.cancel();
    });
});
