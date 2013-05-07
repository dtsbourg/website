
// FIXME: Refactor!

var async = require( 'async' ),
    by = require( '../sortby' ),
    config = require( '../../conf' ),
    nop = function() {};

function filterAlbums( albums )
{
    var filtered = [];

    albums.forEach( function( album )
    {
        if( album.type !== 'profile' && album.name !== 'Cover Photos' )
        {
            filtered.push( album );
        }
    } );

    return filtered;
}

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
                return;
            }
            
            res.data = filterAlbums( res.data );
            res.data.sort( by( 'created_time' ).desc );
            
            async.map( res.data, self.fetchPhotos.bind( self ), function( err, albums )
            {
                if( err )
                {
                    console.error( '[ERROR] Unable to fetch album: ', err );
                    process.nextTick( function()
                    {
                        ( callback || nop )( err );
                    } );
                    return;
                }

                albums.findById = function( id )
                {
                    for( var i = 0; i < this.length; i++ )
                    {
                        if( this[ i ].id == id )
                        {
                            return this[ i ];
                        }
                    }

                    return null;
                };

                process.nextTick( function()
                {
                    ( callback || nop )( null, albums );
                } );
            } );
        } );
    },

    fetchPhotos: function( album, callback )
    {
        this.FB.api( album.id + '/photos', { limit: 200 }, function( res )
        {
            album.photos = res.data;

            process.nextTick( function()
            {
                ( callback || nop )( null, album );
            } );
        } );
    }

};

module.exports = Albums;
