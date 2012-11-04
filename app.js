
var events = require( './lib/events' ),
    albums = require( './lib/albums' ),
    async  = require( 'async' );

function refreshData()
{
    async.series(
        [
            events.fetchAll.bind( events ),
            albums.fetchAll.bind( albums )
        ],
        function( err, results )
        {
            if( err )
            {
                console.log( 'An error occured: ' + err );
                return;
            }

            console.log( 'Events: ', results[ 0 ] );
            console.log( 'Albums: ', results[ 1 ] );
        }
    );

    setTimeout( refreshData, 15 * 60 * 1000 );
}

refreshData();
