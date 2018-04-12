$( document ).ready( function() {
    // Focus on the input element, where user's type their messages
    $( "#text-field" ).focus();
    // Scroll the message container element to the bottom, so users see the most recent messages
    $( '#msg-container' ).scrollTop( $( '#msg-container' )[0].scrollHeight );
    
    // Socket events
    var url = $( location ).attr( 'host' );
    var socket = io.connect( url );
    
    // Start event listener for Speech Recognition
    function onAnythingSaid( text ) {
        console.log( "onAnythingSaid:\n" + text );
    }
    function onFinalised( text ) {
        socket.emit( 'message', text );
    }
    function onFinishedListening() {
        
    }
    var listener = new SpeechToText( onAnythingSaid, onFinalised, onFinishedListening );
    listener.startListening();
    
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
