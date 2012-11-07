
var async = require( 'async' ),
    by = require( '../sortby' ),
    config = require( '../config' ),
    nop = function() {};

function Albums( FB )
{
    if( !( this instanceof Albums ) )
    {
        return new Albums( FB );
    }

    this.FB = FB;
}

Albums.prototype = {

    fetch: function( callback )
    {
        var self = this;

        this.FB.api( config.PAGE_ID + '/albums', function( res )
        {
            if( !res || res.error )
            {
                console.error( '[ERROR] Unable to fetch photo albums: ', res && res.error || 'unknow error' );
            }
            else
            {
                res.data.sort( by( 'created_time' ).desc );
            }
            
            process.nextTick( function()
            {
                ( callback || nop )( res.error, res && res.data || null );
            } );
        } );

    }

};

module.exports = Albums;
