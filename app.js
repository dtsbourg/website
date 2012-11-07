
var fb   = require( './lib/fb' ),
    data = require( './lib/data' ),
    express = require( 'express' ),
    app = express();

function refreshData()
{
    fb.connect( function( FB )
    {
        data.fetchAll( FB, function( err, data )
        {
            console.log( 'Fetched data:', data );
        } );
    } );

    setTimeout( refreshData, 60 * 15 * 100 );
}

refreshData();