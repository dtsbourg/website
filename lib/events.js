
var async = require( 'async' ),
    FB = require( 'fb' ),
    by = require( './sortby' ),
    config = require( './config' ),
    nop = function() {};

FB.setAccessToken( config.ACCESS_TOKEN );

module.exports = {

    events: null,

    fetchAll: function( callback )
    {
        var self = this;
        
        this.events = { future: [], past: [] };

        FB.api( config.PAGE_ID + '/events', function( res )
        {
            async.forEach( res.data, self.fetchDetail.bind( self ), function( err )
            {
                if( err )
                {
                    console.log( '[ERROR] Unable to fetch events: ' + err );
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

        FB.api( event.id, function( event )
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
