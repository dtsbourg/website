
var fb   = require( './lib/fb' ),
    data = require( './lib/data' ),
    express = require( 'express' ),
    app = module.exports = express();

function refreshData()
{
    fb.connect( function( FB )
    {
        data.fetchAll( FB, function( err, data )
        {
            console.log( 'Fetched events:', data.events.future );

            app.locals.albums = data.albums;
            app.locals.events = data.events;
        } );
    } );

    setTimeout( refreshData, 60 * 15 * 100 );
}

refreshData();

app.enable( 'trust proxy' );

app.set( 'views', __dirname + '/views' );
app.engine( 'ejs', require( 'ejs-locals' ) );
app.locals._layoutFile = '/layout.ejs';
app.set( 'view engine', 'ejs' );

app.get( '/', function( req, res )
{
    res.render( 'home', { title: 'Home', events: app.locals.events } );
} );

app.use( express.static( __dirname + '/public' ) );

if( !module.parent )
{
    var port = process.env.PORT || 3000;
    
    app.listen( port );
    console.log( 'Express app started on port ' + port );
}
