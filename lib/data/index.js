
var Events = require( './events' ),
    Albums = require( './albums' ),
    async  = require( 'async' ),
    nop    = function() {};

function fetchAll( FB, callback )
{
    var self   = this,
        events = Events( FB ),
        albums = Albums( FB );
    
    async.parallel(
        [
            events.fetch.bind( events ),
            albums.fetch.bind( albums )
        ],
        function( err, results )
        {
            var data;

            if( err )
            {
                console.error( '[ERROR]', err );
            }
            else
            {
                data = {
                    events: results[ 0 ],
                    albums: results[ 1 ]
                };
            }

            process.nextTick( function()
            {
                ( callback || nop )( err, data );
            } );
        }
    );
};

module.exports = {
    Events: Events,
    Albums: Albums,
    fetchAll: fetchAll
}
