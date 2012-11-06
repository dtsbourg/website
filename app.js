
var Events = require( './lib/events' ),
    Albums = require( './lib/albums' ),
    fb     = require( './lib/fb' ),
    async  = require( 'async' );

function fetchData( FB )
{
    var events = Events( FB ),
        albums = Albums( FB );

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
}

function refreshData()
{
    fb.connect( fetchData );

    setTimeout( refreshData, 15 * 60 * 1000 );
}

refreshData();
