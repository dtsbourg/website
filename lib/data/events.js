
var async = require( 'async' ),
    by = require( '../sortby' ),
    config = require( '../config' ),
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

    fetch: function( callback )
    {
        var self = this;

        this.FB.api( config.PAGE_ID + '/events', function( res )
        {
            if( !res || res.error )
            {
                console.error( '[ERROR] Unable to fetch events: ', res && res.error || 'unknow error' );
                return;
            }

            async.map( res.data, self.fetchOne.bind( self ), function( err, events )
            {
                if( err )
                {
                    console.error( '[ERROR] Unable to fetch event: ', err );
                    return;
                }

                events.sort( by( 'start_time' ).desc );

                process.nextTick( function()
                {
                    ( callback || nop )( null, events );
                } );
            } );
        } );

    },

    fetchOne: function( event, callback )
    {
        var self = this,
            now = +new Date();

        this.FB.api( event.id, function( event )
        {
            event.start_time = new Date( event.start_time );
            event.when = event.start_time.valueOf() > now ? 'future' : 'past';

            process.nextTick( function()
            {
                ( callback || nop )( null, event );
            } );
        } );
        
    }

};

module.exports = Events;
