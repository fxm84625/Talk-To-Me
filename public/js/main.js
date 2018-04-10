$( document ).ready( function() {
    // Focus on the input element, where user's type their messages
    $( "#text-field" ).focus();
    // Scroll the message container element to the bottom, so users see the most recent messages
    $( '#msg-container' ).scrollTop( $( '#msg-container' )[0].scrollHeight );
    
    // Socket events
    var url = $( location ).attr( 'host' );
    var socket = io.connect( url );
    
    $( '#msg-submit' ).on( 'click', function( event ) {
        event.preventDefault();
        socket.emit( 'message', $( '#msg-field' ).val() );
        $( '#msg-field' ).val( '' );
    });
    
    socket.on( 'renderMessage', function( data ) {
        if( data.bot ) $( '#msg-container' ).append( '<div class="bot-msg">' + data.text + '</div>' );
        else $( '#msg-container' ).append( '<div class="user-msg">' + data.text + '</div>' );
    });
});
