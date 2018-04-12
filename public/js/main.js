$( document ).ready( function() {
    // Focus on the input element, where user's type their messages
    $( "#text-field" ).focus();
    // Scroll the message container element to the bottom, so users see the most recent messages
    $( '#msg-container' ).scrollTop( $( '#msg-container' )[0].scrollHeight );
    
    // Socket events
    var url = $( location ).attr( 'host' );
    var socket = io.connect( url );
    
    // onAnythingSaid runs every time the User says something
    // Mark the User as currently active, so the Empathy bot does not interrupt them
    function onAnythingSaid( text ) {
        console.log( "onAnythingSaid:\n" + text );
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
    
    socket.on( 'renderMessage', function( data ) {
        if( data.bot ) $( '#msg-container' ).append( '<div class="bot-msg"></div>' );
        else $( '#msg-container' ).append( '<div class="user-msg"></div>' );
        $( '#msg-container div:last-child' ).text( data.text );
        // Scroll the message container element to the bottom, so users see the most recent messages
        $( '#msg-container' ).scrollTop( $( '#msg-container' )[0].scrollHeight );
    });
});
