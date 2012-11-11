
!( function( $ )
{
    'use strict';

    $( function()
    {
        var $form = $( '#subscribe' ),
            url   = $form.attr( 'action' );

        $form.submit( function( e )
        {
            e.preventDefault();

            var data = $form.serialize();

            $.post( url, data ).then(
                function( data, status, xhr )
                {
                    if( status === 'success' && data.status === 'subscribed' )
                    {
                        $form.find( '.email' ).val( '' ).attr( 'placeholder', data.message );
                    }
                },
                function( xhr, type, msg )
                {
                    var error = xhr.responseText && ( JSON.parse( xhr.responseText ) ).error || 'Internal server error.';

                    $form.find( '.email' ).val( '' ).attr( 'placeholder', error );
                }
            );
        } );
    } );

} )( jQuery );