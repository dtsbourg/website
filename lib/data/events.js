
// FIXME: Refactor!

var pastEvents = [
    '225407220917660', // Facebook Hackathon
    '545050492205700', // Drinkup #1
    '422552357829134'  // NASA Space Apps Challenge
];

var async = require( 'async' ),
    by = require( '../sortby' ),
    config = require( '../../conf' ),
    utils = require( '../utils' );

function Events( FB )
{
    if( !( this instanceof Events ) )
    {
        return new Events( FB );
    }

    this.FB = FB;
}

// FIXME: Should be part of Events.prototype.
Events.slugMap = {};

Events.prototype = {

    fetch: function( callback )
    {
        var self = this;
            // since = ( new Date( '2011-01-01 01:01' ) ).toISOString();

        this.FB.api( config.PAGE_ID + '/events', function( res )
        {
            if( !res || res.error )
            {
                console.error( '[ERROR] Unable to fetch events: ', res && res.error || 'unknow error' );
                return;
            }

            // Add back the past events, since they don't show up
            // anymore in the Graph API results...
            var allEvents = res.data.concat( pastEvents.map( function( pastEvent ) {
                return { id: pastEvent };
            } ) );

            async.map( allEvents, self.fetchOne.bind( self ), function( err, events )
            {
                if( err )
                {
                    console.error( '[ERROR] Unable to fetch event: ', err );
                    return;
                }

                events = self.groupEventByTime( events );

                process.nextTick( function()
                {
                    ( callback || utils.nop )( null, events );
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
            event.slug = utils.slug( event.name );
            event.summary = ( event.description ) ? event.description.split( '\n' ).shift() : '';
            event.htmlDescription = utils.nl2br( utils.autolink( event.description ) );

            Events.slugMap[ event.slug ] = event;

            process.nextTick( function()
            {
                ( callback || utils.nop )( null, event );
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
