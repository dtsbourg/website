
var config = require( './config' ),
    FB     = require( 'fb' ),
    nop    = function() {};

exports.connect = function( callback )
{
    FB.api( 'oauth/access_token',
    {
        client_id: config.APP_ID,
        client_secret: config.APP_SECRET,
        grant_type: 'client_credentials'
    },
    function( res )
    {
        if( !res || res.error )
        {
            console.log( '[ERROR] Unable to connect,', res.error );
            return;
        }

        console.log( res );

        var accessToken = res.access_token,
            expires     = res.expires ? res.expires : 0;

        FB.setAccessToken( accessToken );
        FB.tokenExpires = expires;

        exports.connect = function( callback )
        {
            process.nextTick( function()
            {
                ( callback || nop )( FB );
            } )
        };

        exports.connect( callback );
    } );
};
