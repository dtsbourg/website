
var async = require( 'async' ),
    by = require( './sortby' ),
    config = require( './config' ),
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

    albums: null,

    fetchAll: function( callback )
    {
        var self = this;

        this.albums = [];

        this.FB.api( config.PAGE_ID + '/albums', function( res )
        {
            if( res.error )
            {
                console.log( '[ERROR] Unable to fetch events: ', res.error );
                return;
            }

            async.forEach( res.data, self.fetchDetail.bind( self ), function( err )
            {
                if( err )
                {
                    console.log( '[ERROR] Unable to fetch photo albums: ' + err );
                    return;
                }

                self.albums.sort( by( 'created_time' ).desc );

                process.nextTick( function()
                {
                    ( callback || nop )( null, self.albums );
                } );
            } );
        } );

    },

    fetchDetail: function( album, callback )
    {
        var self = this;

        this.FB.api( album.id, function( album )
        {
            if( album.type !== 'profile' )
            {
                self.albums.push( album );
            }

            process.nextTick( function()
            {
                ( callback || nop )( null, album );
            } );
        } );

    }

};

module.exports = Albums;
