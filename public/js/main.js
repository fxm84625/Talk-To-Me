$( document ).ready( function() {
    // Focus on the input element, where user's type their messages
    $( "#text-field" ).focus();
    // Scroll the message container element to the bottom, so users see the most recent messages
    $( '#msg-container' ).scrollTop( $( '#msg-container' )[0].scrollHeight );
});
