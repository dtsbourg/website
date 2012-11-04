
var async = require( 'async' ),
    FB = require( 'fb' ),
    by = require( './sortby' ),
    config = require( './config' ),
    nop = function() {};

FB.setAccessToken( config.ACCESS_TOKEN );

module.exports = {

    albums: null,

    fetchAll: function( callback )
    {
        var self = this;

        this.albums = [];

        FB.api( config.PAGE_ID + '/albums', function( res )
        {
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

        FB.api( album.id, function( album )
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
