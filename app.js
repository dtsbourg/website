
var fb   = require( './lib/fb' ),
    data = require( './lib/data' ),
    express = require( 'express' ),
    app = express(),
    albums, events;

function refreshData()
{
    fb.connect( function( FB )
    {
        data.fetchAll( FB, function( err, data )
        {
            console.log( 'Fetched data:', data );

            albums = data.albums;
            events = data.events;
        } );
    } );

    setTimeout( refreshData, 60 * 15 * 100 );
}

refreshData();

app.use( express.static( './public' ) );
app.listen( 3000 );
