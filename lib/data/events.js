
var async = require( 'async' ),
    by = require( '../sortby' ),
    config = require( '../../conf' ),
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

                events = self.groupEventByTime( events );

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
            
            event.description = ( event.description ) ? event.description.split( '\n' ).shift() : '';

            process.nextTick( function()
            {
                ( callback || nop )( null, event );
            } );
        } );
        
    },

    // change this to a generic 'grouper'
    groupEventByTime: function( events )
    {
        var groupedEvents = { future: [], past: [] };

        events.forEach( function( event )
        {
            groupedEvents[ event.when ].push( event );
        } );

        groupedEvents.future.sort( by( 'start_time' ).asc );
        groupedEvents.past.sort( by( 'start_time' ).desc );

        return groupedEvents;
    }

};

module.exports = Events;
