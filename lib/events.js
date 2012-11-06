
var async = require( 'async' ),
    by = require( './sortby' ),
    config = require( './config' ),
    nop = function() {};

function Events( FB )
{
    if( !( this instanceof Events ) )
    {
        return new Events( FB );
    }

    this.FB = FB;
}

Events.prototype = {

    events: null,

    fetchAll: function( callback )
    {
        var self = this;
        
        this.events = { future: [], past: [] };

        this.FB.api( config.PAGE_ID + '/events', function( res )
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
                    console.log( '[ERROR] Unable to fetch event: ', err );
                    return;
                }

                self.events.past.sort( by( 'start_time' ).desc );
                self.events.future.sort( by( 'start_time' ).asc );

                process.nextTick( function()
                {
                    ( callback || nop )( null, self.events );
                } );
            } );
        } );

    },

    fetchDetail: function( event, callback )
    {
        var self = this,
            now = +new Date();

        this.FB.api( event.id, function( event )
        {
            event.start_time = new Date( event.start_time );

            var type = event.start_time.valueOf() > now ? 'future' : 'past';

            self.events[ type ].push( event );

            process.nextTick( function()
            {
                ( callback || nop )( null, event );
            } );
        } );
        
    }

};

module.exports = Events;
